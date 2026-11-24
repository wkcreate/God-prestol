// Донастройка нативных проектов после `cap add`: книжная ориентация, вибрация, номер версии,
// подпись Android из переменных окружения, экспортные настройки iOS. Скрипт можно запускать повторно.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const version = pkg.version;
const [ma, mi, pa] = version.split('.').map(Number);
// номер сборки растёт вместе с версией: 2.1.0 → 2010000, плюс номер запуска CI (BUILD_SEQ) по модулю 100
const build = ma * 1000000 + mi * 10000 + pa * 100 + (Number(process.env.BUILD_SEQ) || 0) % 100;
const edit = (file, fn) => { if (!existsSync(file)) return false; const a = readFileSync(file, 'utf8'), b = fn(a); if (a !== b) writeFileSync(file, b); console.log('настроен', file); return true; };

// ---------- Android ----------
edit('android/app/src/main/AndroidManifest.xml', s => {
  if (!s.includes('android.permission.VIBRATE'))
    s = s.replace(/(<manifest[^>]*>)/, '$1\n    <uses-permission android:name="android.permission.VIBRATE" />');
  if (!/<activity[^>]*screenOrientation/.test(s))
    s = s.replace(/<activity(\s)/, '<activity android:screenOrientation="portrait"$1');
  // защита: сохранения нельзя вытащить или подменить через adb backup и облачную копию
  s = s.replace(/android:allowBackup="true"/, 'android:allowBackup="false"');
  if (!/android:allowBackup=/.test(s)) s = s.replace(/<application(\s)/, '<application android:allowBackup="false"$1');
  return s;
});
// название приложения на языке телефона (по умолчанию английское)
const NAMES = { '': 'Celestial Throne', ru: 'Небесный Престол', uk: 'Небесний Престол', pl: 'Niebiański Tron', es: 'Trono Celestial', pt: 'Trono Celestial', fr: 'Trône céleste', de: 'Himmelsthron', it: 'Trono Celeste', tr: 'Göksel Taht', nl: 'Hemelse Troon', cs: 'Nebeský Trůn', ro: 'Tronul Ceresc', zh: '天之王座', ja: '天穹の玉座', ko: '천공의 왕좌', ar: 'العرش السماوي', hi: 'स्वर्गीय सिंहासन', in: 'Takhta Surgawi', vi: 'Ngai vàng Thiên giới' };
if (existsSync('android/app/src/main/res')) for (const [l, n] of Object.entries(NAMES)) {
  const d = `android/app/src/main/res/values${l ? '-' + l : ''}`, f = d + '/strings.xml';
  if (!l) { edit(f, s => s.replace(/(<string name="app_name">)[^<]*(<\/string>)/, `$1${n}$2`).replace(/(<string name="title_activity_main">)[^<]*(<\/string>)/, `$1${n}$2`)); continue; }
  mkdirSync(d, { recursive: true });
  writeFileSync(f, `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <string name="app_name">${n}</string>\n    <string name="title_activity_main">${n}</string>\n</resources>\n`);
}
edit('android/app/build.gradle', s => {
  s = s.replace(/versionCode\s+\d+/, `versionCode ${build}`).replace(/versionName\s+"[^"]*"/, `versionName "${version}"`);
  if (!s.includes('// np-signing')) s += `
// np-signing: подпись релиза из переменных окружения (секреты GitHub Actions)
android {
    signingConfigs {
        release {
            if (System.getenv("ANDROID_KEYSTORE_PATH")) {
                storeFile file(System.getenv("ANDROID_KEYSTORE_PATH"))
                storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
                keyAlias System.getenv("ANDROID_KEY_ALIAS")
                keyPassword System.getenv("ANDROID_KEY_PASSWORD")
            }
        }
    }
    buildTypes {
        release {
            if (System.getenv("ANDROID_KEYSTORE_PATH")) signingConfig signingConfigs.release
        }
    }
}
`;
  return s;
});

// ---------- iOS ----------
const orient = (key, list) => s => s.replace(new RegExp(`<key>${key.replace('~', '\\~')}</key>\\s*<array>[\\s\\S]*?</array>`),
  `<key>${key}</key>\n\t<array>\n${list.map(o => `\t\t<string>UIInterfaceOrientation${o}</string>`).join('\n')}\n\t</array>`);
const setKey = (key, xml) => s => s.includes(`<key>${key}</key>`)
  ? s.replace(new RegExp(`<key>${key}</key>\\s*<(true|false)/>`), `<key>${key}</key>\n\t${xml}`)
  : s.replace(/<\/dict>\s*<\/plist>\s*$/, `\t<key>${key}</key>\n\t${xml}\n</dict>\n</plist>\n`);
edit('ios/App/App/Info.plist', s => [
  orient('UISupportedInterfaceOrientations', ['Portrait']),
  orient('UISupportedInterfaceOrientations~ipad', ['Portrait', 'PortraitUpsideDown']),
  setKey('UIRequiresFullScreen', '<true/>'),
  setKey('ITSAppUsesNonExemptEncryption', '<false/>'),
].reduce((x, f) => f(x), s));
edit('ios/App/App.xcodeproj/project.pbxproj', s => s
  .replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`)
  .replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${build};`));
console.log(`версия ${version}, сборка ${build}`);
