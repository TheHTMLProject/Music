import SwiftUI

@main
struct MusicApp: App {
    @StateObject private var settings: SettingsStore
    @StateObject private var library: LibraryStore
    @StateObject private var player: PlayerStore

    init() {
        let settings = SettingsStore()
        let library = LibraryStore()
        _settings = StateObject(wrappedValue: settings)
        _library = StateObject(wrappedValue: library)
        _player = StateObject(wrappedValue: PlayerStore(settings: settings, library: library))
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(settings)
                .environmentObject(library)
                .environmentObject(player)
                .font(.custom("Mozilla Text", size: 16, relativeTo: .body))
                .tint(MusicTheme.accent)
        }
    }
}

enum MusicTheme {
    static let accent = Color(red: 0.24, green: 0.67, blue: 0.39)
    static let deepGreen = Color(red: 0.05, green: 0.23, blue: 0.13)
    static let softGreen = Color(red: 0.88, green: 0.97, blue: 0.91)
}
