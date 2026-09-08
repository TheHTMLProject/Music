import AVFoundation
import Combine
import Foundation
import MediaPlayer

@MainActor
final class SettingsStore: ObservableObject {
    @Published var serverAddress: String {
        didSet { UserDefaults.standard.set(serverAddress, forKey: "music.serverAddress") }
    }

    @Published var translationLanguage: String {
        didSet { UserDefaults.standard.set(translationLanguage, forKey: "music.translationLanguage") }
    }

    init() {
        serverAddress = UserDefaults.standard.string(forKey: "music.serverAddress") ?? "http://localhost:3333"
        translationLanguage = UserDefaults.standard.string(forKey: "music.translationLanguage") ?? Locale.current.language.languageCode?.identifier ?? "en"
    }

    var serverURL: URL? {
        let trimmed = serverAddress.trimmingCharacters(in: .whitespacesAndNewlines)
        guard var components = URLComponents(string: trimmed), let scheme = components.scheme?.lowercased(), scheme == "https" || scheme == "http", components.host != nil else { return nil }
        components.path = components.path.replacingOccurrences(of: "/+$", with: "", options: .regularExpression)
        return components.url
    }

    var api: MusicAPI? {
        serverURL.map(MusicAPI.init(baseURL:))
    }
}

@MainActor
final class LibraryStore: ObservableObject {
    @Published private(set) var favorites: [Track] = []
    @Published private(set) var history: [Track] = []
    @Published private(set) var playlists: [MusicPlaylist] = []

    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    init() {
        favorites = decode([Track].self, key: "music.favorites") ?? []
        history = decode([Track].self, key: "music.history") ?? []
        playlists = decode([MusicPlaylist].self, key: "music.playlists") ?? []
    }

    func isFavorite(_ track: Track) -> Bool {
        favorites.contains { $0.id == track.id }
    }

    func toggleFavorite(_ track: Track) {
        if let index = favorites.firstIndex(where: { $0.id == track.id }) {
            favorites.remove(at: index)
        } else {
            favorites.insert(track, at: 0)
        }
        save(favorites, key: "music.favorites")
    }

    func record(_ track: Track) {
        history.removeAll { $0.id == track.id }
        history.insert(track, at: 0)
        if history.count > 100 { history.removeLast(history.count - 100) }
        save(history, key: "music.history")
    }

    func createPlaylist(name: String) {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        playlists.append(MusicPlaylist(name: trimmed))
        save(playlists, key: "music.playlists")
    }

    func deletePlaylists(at offsets: IndexSet) {
        for index in offsets.sorted(by: >) where playlists.indices.contains(index) {
            playlists.remove(at: index)
        }
        save(playlists, key: "music.playlists")
    }

    func add(_ track: Track, to playlistID: UUID) {
        guard let index = playlists.firstIndex(where: { $0.id == playlistID }) else { return }
        guard !playlists[index].tracks.contains(where: { $0.id == track.id }) else { return }
        playlists[index].tracks.append(track)
        save(playlists, key: "music.playlists")
    }

    func removeTracks(at offsets: IndexSet, from playlistID: UUID) {
        guard let index = playlists.firstIndex(where: { $0.id == playlistID }) else { return }
        for trackIndex in offsets.sorted(by: >) where playlists[index].tracks.indices.contains(trackIndex) {
            playlists[index].tracks.remove(at: trackIndex)
        }
        save(playlists, key: "music.playlists")
    }

    func playlist(id: UUID) -> MusicPlaylist? {
        playlists.first { $0.id == id }
    }

    private func decode<T: Decodable>(_ type: T.Type, key: String) -> T? {
        guard let data = UserDefaults.standard.data(forKey: key) else { return nil }
        return try? decoder.decode(type, from: data)
    }

    private func save<T: Encodable>(_ value: T, key: String) {
        guard let data = try? encoder.encode(value) else { return }
        UserDefaults.standard.set(data, forKey: key)
    }
}

@MainActor
final class PlayerStore: ObservableObject {
    @Published private(set) var queue: [Track] = []
    @Published private(set) var currentIndex = -1
    @Published private(set) var currentTrack: Track?
    @Published private(set) var isPlaying = false
    @Published private(set) var isLoading = false
    @Published private(set) var elapsed: TimeInterval = 0
    @Published private(set) var duration: TimeInterval = 0
    @Published var errorMessage: String?
    @Published var shuffle = false
    @Published var repeatMode: RepeatMode = .off

    private let player = AVPlayer()
    private let settings: SettingsStore
    private let library: LibraryStore
    private var timeObserver: Any?
    private var endObserver: NSObjectProtocol?
    private var failureObserver: NSObjectProtocol?
    private var playTask: Task<Void, Never>?
    private var resolvedVideoIDs: [String: String] = [:]

    init(settings: SettingsStore, library: LibraryStore) {
        self.settings = settings
        self.library = library
        configureAudioSession()
        configureObservers()
        configureRemoteCommands()
    }

    deinit {
        if let timeObserver { player.removeTimeObserver(timeObserver) }
        if let endObserver { NotificationCenter.default.removeObserver(endObserver) }
        if let failureObserver { NotificationCenter.default.removeObserver(failureObserver) }
    }

    func play(_ track: Track, within tracks: [Track]? = nil) {
        let source = tracks?.isEmpty == false ? tracks! : [track]
        queue = deduplicated(source)
        currentIndex = queue.firstIndex(where: { $0.id == track.id }) ?? 0
        startCurrent()
    }

    func playQueue(_ tracks: [Track], startingAt index: Int = 0) {
        queue = deduplicated(tracks)
        guard !queue.isEmpty else { return }
        currentIndex = min(max(index, 0), queue.count - 1)
        startCurrent()
    }

    func addToQueue(_ track: Track) {
        guard !queue.contains(where: { $0.id == track.id }) else { return }
        queue.append(track)
        prewarmNext()
    }

    func removeFromQueue(at offsets: IndexSet) {
        for index in offsets.sorted(by: >) {
            guard queue.indices.contains(index), index != currentIndex else { continue }
            queue.remove(at: index)
            if index < currentIndex { currentIndex -= 1 }
        }
    }

    func togglePlayback() {
        guard currentTrack != nil else {
            if !queue.isEmpty {
                currentIndex = max(currentIndex, 0)
                startCurrent()
            }
            return
        }
        if isPlaying {
            player.pause()
            isPlaying = false
        } else {
            activateAudioSession()
            player.play()
            isPlaying = true
        }
        updateNowPlaying()
    }

    func next() {
        guard !queue.isEmpty else { return }
        if shuffle, queue.count > 1 {
            var next = Int.random(in: queue.indices)
            while next == currentIndex { next = Int.random(in: queue.indices) }
            currentIndex = next
        } else if currentIndex + 1 < queue.count {
            currentIndex += 1
        } else if repeatMode == .all {
            currentIndex = 0
        } else {
            player.pause()
            isPlaying = false
            updateNowPlaying()
            return
        }
        startCurrent()
    }

    func previous() {
        if elapsed > 3 {
            seek(to: 0)
            return
        }
        guard !queue.isEmpty else { return }
        if currentIndex > 0 {
            currentIndex -= 1
        } else if repeatMode == .all {
            currentIndex = queue.count - 1
        } else {
            seek(to: 0)
            return
        }
        startCurrent()
    }

    func seek(to seconds: TimeInterval) {
        guard seconds.isFinite else { return }
        let target = min(max(seconds, 0), max(duration, 0))
        player.seek(to: CMTime(seconds: target, preferredTimescale: 600), toleranceBefore: .zero, toleranceAfter: .zero)
        elapsed = target
        updateNowPlaying()
    }

    func cycleRepeat() {
        switch repeatMode {
        case .off: repeatMode = .all
        case .all: repeatMode = .one
        case .one: repeatMode = .off
        }
    }

    private func startCurrent() {
        guard queue.indices.contains(currentIndex), let api = settings.api else {
            errorMessage = MusicAPIError.invalidServer.localizedDescription
            return
        }
        playTask?.cancel()
        let track = queue[currentIndex]
        currentTrack = track
        isLoading = true
        isPlaying = false
        elapsed = 0
        duration = track.duration ?? 0
        errorMessage = nil
        player.pause()
        library.record(track)
        updateNowPlaying()
        playTask = Task { [weak self] in
            guard let self else { return }
            do {
                let videoID = try await self.videoID(for: track, api: api)
                guard !Task.isCancelled, self.currentTrack?.id == track.id else { return }
                let url = try api.audioURL(videoId: videoID)
                let item = AVPlayerItem(url: url)
                self.player.replaceCurrentItem(with: item)
                self.activateAudioSession()
                self.player.play()
                self.isPlaying = true
                self.isLoading = false
                self.updateNowPlaying()
                self.prewarmNext()
            } catch is CancellationError {
                return
            } catch {
                guard !Task.isCancelled else { return }
                self.isLoading = false
                self.isPlaying = false
                self.errorMessage = error.localizedDescription
            }
        }
    }

    private func videoID(for track: Track, api: MusicAPI) async throws -> String {
        if let cached = resolvedVideoIDs[track.id] { return cached }
        let id = try await api.resolveVideo(for: track)
        resolvedVideoIDs[track.id] = id
        return id
    }

    private func prewarmNext() {
        guard let api = settings.api, !queue.isEmpty else { return }
        let nextIndex = currentIndex + 1 < queue.count ? currentIndex + 1 : repeatMode == .all ? 0 : -1
        guard queue.indices.contains(nextIndex) else { return }
        let track = queue[nextIndex]
        Task {
            guard let videoID = try? await videoID(for: track, api: api) else { return }
            await api.prewarm(videoId: videoID)
        }
    }

    private func deduplicated(_ tracks: [Track]) -> [Track] {
        var seen = Set<String>()
        return tracks.filter { seen.insert($0.id).inserted }
    }

    private func configureAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.allowAirPlay])
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func activateAudioSession() {
        try? AVAudioSession.sharedInstance().setActive(true)
    }

    private func configureObservers() {
        timeObserver = player.addPeriodicTimeObserver(forInterval: CMTime(seconds: 0.25, preferredTimescale: 600), queue: .main) { [weak self] time in
            Task { @MainActor in
                guard let self else { return }
                let seconds = time.seconds
                if seconds.isFinite { self.elapsed = max(0, seconds) }
                let itemDuration = self.player.currentItem?.duration.seconds ?? 0
                if itemDuration.isFinite, itemDuration > 0 { self.duration = itemDuration }
                self.updateNowPlaying()
            }
        }
        endObserver = NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime, object: nil, queue: .main) { [weak self] note in
            Task { @MainActor in
                guard let self, let item = note.object as? AVPlayerItem, item === self.player.currentItem else { return }
                if self.repeatMode == .one {
                    self.seek(to: 0)
                    self.player.play()
                    self.isPlaying = true
                } else {
                    self.next()
                }
            }
        }
        failureObserver = NotificationCenter.default.addObserver(forName: .AVPlayerItemFailedToPlayToEndTime, object: nil, queue: .main) { [weak self] note in
            Task { @MainActor in
                guard let self, let item = note.object as? AVPlayerItem, item === self.player.currentItem else { return }
                self.isPlaying = false
                self.isLoading = false
                self.errorMessage = (note.userInfo?[AVPlayerItemFailedToPlayToEndTimeErrorKey] as? Error)?.localizedDescription ?? "Playback failed."
            }
        }
    }

    private func configureRemoteCommands() {
        let center = MPRemoteCommandCenter.shared()
        center.playCommand.addTarget { [weak self] _ in
            Task { @MainActor in
                guard let self else { return }
                if !self.isPlaying { self.togglePlayback() }
            }
            return .success
        }
        center.pauseCommand.addTarget { [weak self] _ in
            Task { @MainActor in
                guard let self else { return }
                if self.isPlaying { self.togglePlayback() }
            }
            return .success
        }
        center.nextTrackCommand.addTarget { [weak self] _ in
            Task { @MainActor in self?.next() }
            return .success
        }
        center.previousTrackCommand.addTarget { [weak self] _ in
            Task { @MainActor in self?.previous() }
            return .success
        }
        center.changePlaybackPositionCommand.addTarget { [weak self] event in
            guard let position = event as? MPChangePlaybackPositionCommandEvent else { return .commandFailed }
            Task { @MainActor in self?.seek(to: position.positionTime) }
            return .success
        }
    }

    private func updateNowPlaying() {
        guard let track = currentTrack else {
            MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
            return
        }
        var info: [String: Any] = [
            MPMediaItemPropertyTitle: track.title,
            MPMediaItemPropertyArtist: track.artist,
            MPNowPlayingInfoPropertyElapsedPlaybackTime: elapsed,
            MPNowPlayingInfoPropertyPlaybackRate: isPlaying ? 1.0 : 0.0
        ]
        if duration > 0 { info[MPMediaItemPropertyPlaybackDuration] = duration }
        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
    }
}
