import Foundation
import SwiftUI

struct RootView: View {
    @EnvironmentObject private var player: PlayerStore
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem { Label("Home", systemImage: "house.fill") }
                .tag(0)
            SearchView()
                .tabItem { Label("Search", systemImage: "magnifyingglass") }
                .tag(1)
            NowPlayingView()
                .tabItem { Label("Playing", systemImage: "play.circle.fill") }
                .tag(2)
            LibraryView()
                .tabItem { Label("Library", systemImage: "music.note.list") }
                .tag(3)
            SettingsView()
                .tabItem { Label("Settings", systemImage: "gearshape.fill") }
                .tag(4)
        }
        .safeAreaInset(edge: .bottom, spacing: 0) {
            if player.currentTrack != nil, selectedTab != 2 {
                MiniPlayerView { selectedTab = 2 }
            }
        }
        .alert("Playback problem", isPresented: Binding(
            get: { player.errorMessage != nil },
            set: { if !$0 { player.errorMessage = nil } }
        )) {
            Button("OK") { player.errorMessage = nil }
        } message: {
            Text(player.errorMessage ?? "Playback failed.")
        }
    }
}

struct HomeView: View {
    @EnvironmentObject private var library: LibraryStore
    @EnvironmentObject private var player: PlayerStore

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 24) {
                    if library.history.isEmpty {
                        ContentUnavailableView("Find your first song", systemImage: "music.note", description: Text("Search the catalog to start listening."))
                            .frame(maxWidth: .infinity)
                            .padding(.top, 80)
                    } else {
                        TrackCarousel(title: "Recently played", tracks: Array(library.history.prefix(12))) { track in
                            player.play(track, within: library.history)
                        }
                        if !library.favorites.isEmpty {
                            TrackCarousel(title: "Favorites", tracks: Array(library.favorites.prefix(12))) { track in
                                player.play(track, within: library.favorites)
                            }
                        }
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Music")
            .background(Color(.systemGroupedBackground))
        }
    }
}

struct SearchView: View {
    @EnvironmentObject private var settings: SettingsStore
    @EnvironmentObject private var player: PlayerStore
    @State private var query = ""
    @State private var tracks: [Track] = []
    @State private var isLoading = false
    @State private var errorMessage: String?

    private var suggested: [Track] { tracks.filter { !$0.community } }
    private var community: [Track] { tracks.filter(\.community) }

    var body: some View {
        NavigationStack {
            Group {
                if isLoading && tracks.isEmpty {
                    ProgressView("Searching")
                } else if let errorMessage, tracks.isEmpty {
                    ContentUnavailableView("Search unavailable", systemImage: "wifi.exclamationmark", description: Text(errorMessage))
                } else if tracks.isEmpty {
                    ContentUnavailableView("Search music", systemImage: "magnifyingglass", description: Text("Songs from the catalog and community uploads are shown separately."))
                } else {
                    List {
                        if !suggested.isEmpty {
                            Section("Suggested songs") {
                                ForEach(suggested) { track in
                                    TrackRow(track: track, source: suggested)
                                }
                            }
                        }
                        if !community.isEmpty {
                            Section("Community uploads") {
                                ForEach(community) { track in
                                    TrackRow(track: track, source: community)
                                }
                            }
                        }
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .navigationTitle("Search")
            .searchable(text: $query, prompt: "Songs, artists, albums")
            .onSubmit(of: .search) { Task { await search() } }
            .toolbar {
                if isLoading {
                    ToolbarItem(placement: .topBarTrailing) { ProgressView() }
                }
            }
        }
    }

    private func search() async {
        let value = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !value.isEmpty else { return }
        guard let api = settings.api else {
            errorMessage = MusicAPIError.invalidServer.localizedDescription
            return
        }
        isLoading = true
        errorMessage = nil
        do {
            tracks = try await api.search(value)
        } catch {
            tracks = []
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}

struct TrackRow: View {
    @EnvironmentObject private var player: PlayerStore
    @EnvironmentObject private var library: LibraryStore
    let track: Track
    let source: [Track]

    var body: some View {
        HStack(spacing: 12) {
            ArtworkView(track: track, size: 52)
            VStack(alignment: .leading, spacing: 3) {
                Text(track.title)
                    .font(.custom("Mozilla Text", size: 16, relativeTo: .body).weight(.semibold))
                    .lineLimit(1)
                Text(track.artist)
                    .font(.custom("Mozilla Text", size: 13, relativeTo: .caption))
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
            Spacer()
            Button {
                player.addToQueue(track)
            } label: {
                Image(systemName: "text.badge.plus")
                    .frame(width: 44, height: 44)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Add to queue")
        }
        .contentShape(Rectangle())
        .onTapGesture { player.play(track, within: source) }
        .contextMenu {
            Button(library.isFavorite(track) ? "Remove from Favorites" : "Add to Favorites", systemImage: library.isFavorite(track) ? "heart.slash" : "heart") {
                library.toggleFavorite(track)
            }
            Button("Add to Queue", systemImage: "text.badge.plus") {
                player.addToQueue(track)
            }
            if !library.playlists.isEmpty {
                Menu("Add to Playlist", systemImage: "music.note.list") {
                    ForEach(library.playlists) { playlist in
                        Button(playlist.name) { library.add(track, to: playlist.id) }
                    }
                }
            }
        }
    }
}

struct NowPlayingView: View {
    @EnvironmentObject private var player: PlayerStore
    @EnvironmentObject private var library: LibraryStore
    @EnvironmentObject private var settings: SettingsStore
    @State private var lyrics: [LyricLine] = []
    @State private var translated: [String]?
    @State private var loadingLyrics = false

    private var activeLyricIndex: Int? {
        let timed = lyrics.enumerated().compactMap { index, line in line.time.map { (index, $0) } }
        return timed.last { $0.1 <= player.elapsed + 0.15 }?.0
    }

    var body: some View {
        NavigationStack {
            Group {
                if let track = player.currentTrack {
                    ScrollViewReader { proxy in
                        ScrollView {
                            VStack(spacing: 24) {
                                ArtworkView(track: track, size: 300)
                                    .shadow(color: .black.opacity(0.18), radius: 20, y: 10)
                                    .padding(.top, 12)
                                VStack(spacing: 6) {
                                    Text(track.title)
                                        .font(.custom("Mozilla Text", size: 25, relativeTo: .title2).weight(.bold))
                                        .multilineTextAlignment(.center)
                                    Text(track.artist)
                                        .font(.custom("Mozilla Text", size: 17, relativeTo: .body))
                                        .foregroundStyle(.secondary)
                                }
                                VStack(spacing: 6) {
                                    Slider(value: Binding(get: { player.elapsed }, set: player.seek), in: 0...max(player.duration, 1))
                                    HStack {
                                        Text(formatTime(player.elapsed))
                                        Spacer()
                                        Text(formatTime(player.duration))
                                    }
                                    .font(.custom("Mozilla Text", size: 12, relativeTo: .caption).monospacedDigit())
                                    .foregroundStyle(.secondary)
                                }
                                .padding(.horizontal)
                                HStack(spacing: 30) {
                                    PlayerToggleButton(systemName: "shuffle", active: player.shuffle) { player.shuffle.toggle() }
                                    Button(action: player.previous) { Image(systemName: "backward.fill") }
                                    Button(action: player.togglePlayback) {
                                        ZStack {
                                            Circle().fill(MusicTheme.accent).frame(width: 68, height: 68)
                                            if player.isLoading {
                                                ProgressView().tint(.black)
                                            } else {
                                                Image(systemName: player.isPlaying ? "pause.fill" : "play.fill")
                                                    .font(.title2)
                                                    .foregroundStyle(.black)
                                            }
                                        }
                                    }
                                    Button(action: player.next) { Image(systemName: "forward.fill") }
                                    PlayerToggleButton(systemName: player.repeatMode.symbol, active: player.repeatMode != .off, action: player.cycleRepeat)
                                }
                                .font(.title2)
                                Button {
                                    library.toggleFavorite(track)
                                } label: {
                                    Label(library.isFavorite(track) ? "Favorited" : "Favorite", systemImage: library.isFavorite(track) ? "heart.fill" : "heart")
                                }
                                lyricsSection
                                queueSection
                            }
                            .padding()
                        }
                        .onChange(of: activeLyricIndex) { _, index in
                            if let index { withAnimation { proxy.scrollTo(lyrics[index].id, anchor: .center) } }
                        }
                    }
                } else {
                    ContentUnavailableView("Nothing playing", systemImage: "play.circle", description: Text("Choose a song from Search or Library."))
                }
            }
            .navigationTitle("Now Playing")
            .navigationBarTitleDisplayMode(.inline)
            .task(id: player.currentTrack?.id) { await loadLyrics() }
        }
    }

    @ViewBuilder
    private var lyricsSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("Lyrics")
                    .font(.custom("Mozilla Text", size: 22, relativeTo: .title2).weight(.bold))
                Spacer()
                if !lyrics.isEmpty {
                    Button(translated == nil ? "Translate" : "Original") {
                        Task { await toggleTranslation() }
                    }
                    .buttonStyle(.bordered)
                }
            }
            if loadingLyrics {
                ProgressView("Finding lyrics")
            } else if lyrics.isEmpty {
                Text("Lyrics are unavailable for this track.")
                    .foregroundStyle(.secondary)
            } else {
                ForEach(lyrics.indices, id: \.self) { index in
                    let line = lyrics[index]
                    Text(translated?[safe: index] ?? line.text)
                        .font(.custom("Mozilla Text", size: index == activeLyricIndex ? 22 : 18, relativeTo: .body).weight(index == activeLyricIndex ? .bold : .regular))
                        .foregroundStyle(index == activeLyricIndex ? .primary : .secondary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .id(line.id)
                        .onTapGesture {
                            if let time = line.time { player.seek(to: time) }
                        }
                }
            }
        }
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 24))
    }

    private var queueSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Queue")
                .font(.custom("Mozilla Text", size: 22, relativeTo: .title2).weight(.bold))
            ForEach(player.queue.indices, id: \.self) { index in
                let track = player.queue[index]
                HStack {
                    Image(systemName: index == player.currentIndex ? "speaker.wave.2.fill" : "music.note")
                        .foregroundStyle(index == player.currentIndex ? MusicTheme.accent : .secondary)
                        .frame(width: 24)
                    VStack(alignment: .leading) {
                        Text(track.title).lineLimit(1)
                        Text(track.artist).font(.caption).foregroundStyle(.secondary).lineLimit(1)
                    }
                }
                .contentShape(Rectangle())
                .onTapGesture { player.play(track, within: player.queue) }
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 24))
    }

    private func loadLyrics() async {
        lyrics = []
        translated = nil
        guard let track = player.currentTrack, let api = settings.api else { return }
        loadingLyrics = true
        defer { loadingLyrics = false }
        guard let response = try? await api.lyrics(for: track), player.currentTrack?.id == track.id else { return }
        if let synced = response.syncedLyrics {
            lyrics = parseLRC(synced)
        } else if let plain = response.plainLyrics {
            lyrics = plain.components(separatedBy: .newlines).filter { !$0.isEmpty }.map { LyricLine(time: nil, text: $0) }
        }
    }

    private func toggleTranslation() async {
        if translated != nil {
            translated = nil
            return
        }
        guard let api = settings.api, !lyrics.isEmpty else { return }
        do {
            let response = try await api.translate(lyrics.map(\.text), target: settings.translationLanguage)
            if !response.sameLanguage { translated = response.lines }
        } catch {
            player.errorMessage = error.localizedDescription
        }
    }
}

struct LibraryView: View {
    @EnvironmentObject private var library: LibraryStore
    @EnvironmentObject private var player: PlayerStore
    @State private var showingNewPlaylist = false
    @State private var playlistName = ""

    var body: some View {
        NavigationStack {
            List {
                Section("Favorites") {
                    if library.favorites.isEmpty {
                        Text("Songs you favorite appear here.").foregroundStyle(.secondary)
                    } else {
                        ForEach(library.favorites) { track in TrackRow(track: track, source: library.favorites) }
                    }
                }
                Section("Playlists") {
                    ForEach(library.playlists) { playlist in
                        NavigationLink {
                            PlaylistView(playlistID: playlist.id)
                        } label: {
                            Label {
                                VStack(alignment: .leading) {
                                    Text(playlist.name)
                                    Text("\(playlist.tracks.count) songs").font(.caption).foregroundStyle(.secondary)
                                }
                            } icon: {
                                Image(systemName: "music.note.list")
                            }
                        }
                    }
                    .onDelete(perform: library.deletePlaylists)
                    Button("New Playlist", systemImage: "plus") { showingNewPlaylist = true }
                }
            }
            .navigationTitle("Library")
            .alert("New Playlist", isPresented: $showingNewPlaylist) {
                TextField("Playlist name", text: $playlistName)
                Button("Create") {
                    library.createPlaylist(name: playlistName)
                    playlistName = ""
                }
                Button("Cancel", role: .cancel) { playlistName = "" }
            }
        }
    }
}

struct PlaylistView: View {
    @EnvironmentObject private var library: LibraryStore
    @EnvironmentObject private var player: PlayerStore
    let playlistID: UUID

    private var playlist: MusicPlaylist? { library.playlist(id: playlistID) }

    var body: some View {
        List {
            if let playlist {
                if playlist.tracks.isEmpty {
                    Text("Add songs from a track's menu.").foregroundStyle(.secondary)
                } else {
                    Button("Play", systemImage: "play.fill") { player.playQueue(playlist.tracks) }
                    ForEach(playlist.tracks) { track in TrackRow(track: track, source: playlist.tracks) }
                        .onDelete { library.removeTracks(at: $0, from: playlistID) }
                }
            }
        }
        .navigationTitle(playlist?.name ?? "Playlist")
    }
}

struct SettingsView: View {
    @EnvironmentObject private var settings: SettingsStore
    @State private var connectionState = ""
    @State private var testing = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Music server") {
                    TextField("https://music.example.com", text: $settings.serverAddress)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.URL)
                        .autocorrectionDisabled()
                    Button(testing ? "Testing" : "Test Connection") { Task { await testConnection() } }
                        .disabled(testing)
                    if !connectionState.isEmpty { Text(connectionState).foregroundStyle(.secondary) }
                }
                Section("Lyrics") {
                    TextField("Translation language code", text: $settings.translationLanguage)
                        .textInputAutocapitalization(.never)
                    Text("Examples: en, es, fr, de, ja")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Section {
                    Text("Use HTTPS for a server outside your local network. The iOS simulator can reach a server running on the Mac at localhost.")
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Settings")
        }
    }

    private func testConnection() async {
        guard let api = settings.api else {
            connectionState = MusicAPIError.invalidServer.localizedDescription
            return
        }
        testing = true
        do {
            try await api.status()
            connectionState = "Connected"
        } catch {
            connectionState = error.localizedDescription
        }
        testing = false
    }
}

struct MiniPlayerView: View {
    @EnvironmentObject private var player: PlayerStore
    let open: () -> Void

    var body: some View {
        if let track = player.currentTrack {
            HStack(spacing: 12) {
                Button(action: open) {
                    HStack(spacing: 12) {
                        ArtworkView(track: track, size: 46)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(track.title).lineLimit(1)
                            Text(track.artist).font(.caption).foregroundStyle(.secondary).lineLimit(1)
                        }
                    }
                }
                .buttonStyle(.plain)
                Spacer()
                Button(action: player.togglePlayback) {
                    if player.isLoading {
                        ProgressView().frame(width: 44, height: 44)
                    } else {
                        Image(systemName: player.isPlaying ? "pause.fill" : "play.fill").frame(width: 44, height: 44)
                    }
                }
                Button(action: player.next) { Image(systemName: "forward.fill").frame(width: 44, height: 44) }
            }
            .padding(.horizontal)
            .padding(.vertical, 7)
            .background(.ultraThinMaterial)
            .overlay(alignment: .top) {
                GeometryReader { geometry in
                    Rectangle()
                        .fill(MusicTheme.accent)
                        .frame(width: geometry.size.width * min(max(player.elapsed / max(player.duration, 1), 0), 1), height: 2)
                }
                .frame(height: 2)
            }
        }
    }
}

struct TrackCarousel: View {
    let title: String
    let tracks: [Track]
    let play: (Track) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.custom("Mozilla Text", size: 22, relativeTo: .title2).weight(.bold))
                .padding(.horizontal)
            ScrollView(.horizontal, showsIndicators: false) {
                LazyHStack(spacing: 14) {
                    ForEach(tracks) { track in
                        Button { play(track) } label: {
                            VStack(alignment: .leading, spacing: 8) {
                                ArtworkView(track: track, size: 150)
                                Text(track.title).font(.headline).lineLimit(1)
                                Text(track.artist).font(.caption).foregroundStyle(.secondary).lineLimit(1)
                            }
                            .frame(width: 150, alignment: .leading)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal)
            }
        }
    }
}

struct ArtworkView: View {
    let track: Track
    let size: CGFloat

    var body: some View {
        AsyncImage(url: track.artworkURL) { phase in
            if let image = phase.image {
                image.resizable().scaledToFill()
            } else {
                ZStack {
                    LinearGradient(colors: [MusicTheme.deepGreen, MusicTheme.accent], startPoint: .topLeading, endPoint: .bottomTrailing)
                    Image(systemName: "music.note").font(.system(size: size * 0.28)).foregroundStyle(.white)
                }
            }
        }
        .frame(width: size, height: size)
        .clipShape(RoundedRectangle(cornerRadius: size * 0.1))
    }
}

struct PlayerToggleButton: View {
    let systemName: String
    let active: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: systemName)
                .foregroundStyle(active ? MusicTheme.accent : .secondary)
                .frame(width: 44, height: 44)
        }
    }
}

private func formatTime(_ value: TimeInterval) -> String {
    guard value.isFinite, value >= 0 else { return "0:00" }
    let total = Int(value)
    return String(format: "%d:%02d", total / 60, total % 60)
}

private func parseLRC(_ input: String) -> [LyricLine] {
    let expression = try? NSRegularExpression(pattern: #"\[(\d{1,3}):(\d{1,2})(?:[\.:](\d{1,3}))?\](.*)"#)
    var output: [LyricLine] = []
    for rawLine in input.components(separatedBy: .newlines) {
        let range = NSRange(rawLine.startIndex..., in: rawLine)
        guard let match = expression?.firstMatch(in: rawLine, range: range), match.numberOfRanges == 5,
              let minuteRange = Range(match.range(at: 1), in: rawLine),
              let secondRange = Range(match.range(at: 2), in: rawLine),
              let textRange = Range(match.range(at: 4), in: rawLine) else { continue }
        let minutes = Double(rawLine[minuteRange]) ?? 0
        let seconds = Double(rawLine[secondRange]) ?? 0
        var fraction = 0.0
        if let fractionRange = Range(match.range(at: 3), in: rawLine) {
            let digits = String(rawLine[fractionRange])
            fraction = (Double(digits) ?? 0) / pow(10, Double(digits.count))
        }
        let text = String(rawLine[textRange]).trimmingCharacters(in: .whitespaces)
        if !text.isEmpty { output.append(LyricLine(time: minutes * 60 + seconds + fraction, text: text)) }
    }
    return output.sorted { ($0.time ?? 0) < ($1.time ?? 0) }
}

private extension Collection {
    subscript(safe index: Index) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
