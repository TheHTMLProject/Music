import Foundation

struct Track: Codable, Identifiable, Hashable, Sendable {
    let trackName: String
    let artistName: String
    let artworkUrl100: String?
    let artworkUrl60: String?
    let trackId: String
    var videoId: String?
    let collectionName: String?
    let source: String?
    let community: Bool
    let trackTimeMillis: Double?

    var id: String {
        videoId ?? trackId
    }

    var title: String {
        trackName.isEmpty ? "Unknown track" : trackName
    }

    var artist: String {
        artistName.isEmpty ? "Unknown artist" : artistName
    }

    var duration: TimeInterval? {
        guard let trackTimeMillis, trackTimeMillis > 0 else { return nil }
        return trackTimeMillis / 1000
    }

    var artworkURL: URL? {
        let raw = artworkUrl100 ?? artworkUrl60
        guard let raw else { return nil }
        let enlarged = raw
            .replacingOccurrences(of: "100x100", with: "600x600")
            .replacingOccurrences(of: "60x60", with: "600x600")
        return URL(string: enlarged)
    }

    enum CodingKeys: String, CodingKey {
        case trackName
        case artistName
        case artworkUrl100
        case artworkUrl60
        case trackId
        case videoId
        case collectionName
        case source
        case community
        case trackTimeMillis
    }

    init(from decoder: Decoder) throws {
        let values = try decoder.container(keyedBy: CodingKeys.self)
        trackName = try values.decodeIfPresent(String.self, forKey: .trackName) ?? ""
        artistName = try values.decodeIfPresent(String.self, forKey: .artistName) ?? ""
        artworkUrl100 = try values.decodeIfPresent(String.self, forKey: .artworkUrl100)
        artworkUrl60 = try values.decodeIfPresent(String.self, forKey: .artworkUrl60)
        if let string = try? values.decode(String.self, forKey: .trackId) {
            trackId = string
        } else if let integer = try? values.decode(Int64.self, forKey: .trackId) {
            trackId = String(integer)
        } else {
            trackId = UUID().uuidString
        }
        videoId = try values.decodeIfPresent(String.self, forKey: .videoId)
        collectionName = try values.decodeIfPresent(String.self, forKey: .collectionName)
        source = try values.decodeIfPresent(String.self, forKey: .source)
        community = try values.decodeIfPresent(Bool.self, forKey: .community) ?? false
        trackTimeMillis = try values.decodeIfPresent(Double.self, forKey: .trackTimeMillis)
    }

    init(trackName: String, artistName: String, artworkUrl100: String?, artworkUrl60: String?, trackId: String, videoId: String?, collectionName: String?, source: String?, community: Bool, trackTimeMillis: Double?) {
        self.trackName = trackName
        self.artistName = artistName
        self.artworkUrl100 = artworkUrl100
        self.artworkUrl60 = artworkUrl60
        self.trackId = trackId
        self.videoId = videoId
        self.collectionName = collectionName
        self.source = source
        self.community = community
        self.trackTimeMillis = trackTimeMillis
    }
}

struct SearchResponse: Decodable, Sendable {
    let songs: [Track]
}

struct VideoResolution: Decodable, Sendable {
    let videoId: String
}

struct LyricsResponse: Decodable, Sendable {
    let syncedLyrics: String?
    let plainLyrics: String?
    let instrumental: Bool
}

struct TranslationResponse: Decodable, Sendable {
    let lines: [String]
    let target: String
    let sourceLanguage: String
    let sameLanguage: Bool
}

struct MusicPlaylist: Codable, Identifiable, Hashable {
    let id: UUID
    var name: String
    var tracks: [Track]

    init(id: UUID = UUID(), name: String, tracks: [Track] = []) {
        self.id = id
        self.name = name
        self.tracks = tracks
    }
}

struct LyricLine: Identifiable, Hashable {
    let id = UUID()
    let time: TimeInterval?
    let text: String
}

enum RepeatMode: String, CaseIterable {
    case off
    case all
    case one

    var symbol: String {
        self == .one ? "repeat.1" : "repeat"
    }
}

enum MusicAPIError: LocalizedError {
    case invalidServer
    case invalidResponse
    case requestFailed(Int, String)
    case noPlayableResult

    var errorDescription: String? {
        switch self {
        case .invalidServer:
            return "Enter a valid music server URL in Settings."
        case .invalidResponse:
            return "The music server returned an invalid response."
        case let .requestFailed(code, message):
            return message.isEmpty ? "The music server returned HTTP \(code)." : message
        case .noPlayableResult:
            return "No playable recording was found."
        }
    }
}
