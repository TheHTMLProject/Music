# Music for iOS

Open `Music.xcodeproj` in Xcode 16 or newer. Choose your Apple development team in Signing & Capabilities, select an iPhone simulator or device, and run the `Music` scheme.

The app targets iOS 17 and uses the same self-hosted server as the web client. Open Settings in the app and enter the complete server URL. The simulator can use `http://localhost:3333` when the server runs on the Mac. A physical iPhone should use an HTTPS URL, or a local hostname allowed by App Transport Security.

Background audio and lock-screen controls are enabled. Search, suggested songs, community uploads, playback, seeking, queue advancement, lyrics, translation, favorites, recent history, and playlists use native SwiftUI interfaces. Library data remains on the device.

Mozilla Text and its OFL license are bundled in `Music/Resources`.
