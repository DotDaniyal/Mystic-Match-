# Mystic Match – Android App & APK Guide

This project contains the complete native Android build of **Mystic Match** (`com.dnyl.mysticmatch`).

---

## 📱 Generated APK Files

- **Debug APK**: [`android/app/build/outputs/apk/debug/app-debug.apk`](android/app/build/outputs/apk/debug/app-debug.apk) (6.45 MB)
- **Release APK**: [`android/app/build/outputs/apk/release/app-release.apk`](android/app/build/outputs/apk/release/app-release.apk) (5.03 MB)

Both APKs are ready for immediate sideloading onto any Android phone or tablet (Android 7.0 / API 24 through Android 16 / API 36).

---

## 🚀 Quick Install & Run via ADB

If you have an Android device connected via USB with USB Debugging enabled:

```bash
# Install the debug APK
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Launch Mystic Match on your device
adb shell am start -n com.dnyl.mysticmatch/com.dnyl.mysticmatch.MainActivity
```

---

## 🛠 Rebuilding the APK

Whenever you make changes to the game source code in `src/`:

```bash
# 1. Build the web app
npm run build

# 2. Sync web assets into Android
npx cap sync android

# 3. Assemble Android APKs
cd android
./gradlew assembleDebug assembleRelease
```

---

## 🔐 Production Signing Instructions

To sign the release APK with your own production keystore:

1. Generate your production keystore (if you don't already have one):
   ```bash
   keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias mystic-key
   ```
2. In `android/gradle.properties`, define your credentials:
   ```properties
   MYSTIC_RELEASE_STORE_FILE=C:/path/to/my-release-key.jks
   MYSTIC_RELEASE_STORE_PASSWORD=your_store_password
   MYSTIC_RELEASE_KEY_ALIAS=mystic-key
   MYSTIC_RELEASE_KEY_PASSWORD=your_key_password
   ```
3. Run:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   The signed production APK will be produced at `android/app/build/outputs/apk/release/app-release.apk`.
