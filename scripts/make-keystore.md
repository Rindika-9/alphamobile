# Create the release keystore (you do this once, yourself)

Google Play needs every update to be signed with the **same upload key**. If you lose the
keystore or its password, you must ask Google to reset your upload key. Keep **two
backups** (for example a USB drive and an encrypted cloud folder) and keep the passwords in
a password manager. **Never commit the `.jks` file or `android/key.properties` to Git.**
Both are in `.gitignore`.

## 1. Make a folder outside the project

```powershell
mkdir D:\alphamobile-keys
```

## 2. Run keytool

`keytool` comes with the JDK (`C:\Program Files\Java\jdk-21\bin\keytool.exe`). It asks for
the password and your name/organisation. **Choose the password yourself.**

```powershell
& "C:\Program Files\Java\jdk-21\bin\keytool.exe" -genkeypair -v `
  -keystore D:\alphamobile-keys\alpha-mobile-release.jks `
  -alias alpha-mobile `
  -keyalg RSA -keysize 2048 -validity 10000
```

- "First and last name": your name or "Alpha Mobile"
- "Organizational unit / Organization": Alpha Mobile
- "City": Aizawl · "State": Mizoram · "Country code": IN

Recent JDKs make a PKCS12 keystore, so the key password is the same as the store password.

## 3. Fill in `android/key.properties`

A template already exists at `android/key.properties`. It is ignored by Git. Replace the
`CHANGE_ME` values:

```properties
storeFile=D:/alphamobile-keys/alpha-mobile-release.jks
storePassword=YOUR_PASSWORD
keyAlias=alpha-mobile
keyPassword=YOUR_PASSWORD
```

Use forward slashes `/` in the path.

## 4. Build the signed bundle

```powershell
cd D:\alphamobile
pnpm build
npx cap sync android
cd android
.\gradlew.bat bundleRelease
```

Output: `android\app\build\outputs\bundle\release\app-release.aab`

To check that it is signed:

```powershell
& "C:\Program Files\Java\jdk-21\bin\jarsigner.exe" -verify -verbose -certs app\build\outputs\bundle\release\app-release.aab | Select-String "jar verified"
```

## 5. Play App Signing

When you upload the first `.aab`, accept **Play App Signing**. Google then keeps the real
app-signing key, and your keystore becomes the *upload key*. If the upload key is ever lost,
Google can reset it.
