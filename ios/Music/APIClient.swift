import Foundation

struct MusicAPI: Sendable {
    let baseURL: URL

    func search(_ query: String) async throws -> [Track] {
        let response: SearchResponse = try await get("music/meta", query: ["q": query, "community": "1"])
        return response.songs
    }

    func resolveVideo(for track: Track) async throws -> String {
        if let videoId = track.videoId, !videoId.isEmpty { return videoId }
        var query = ["q": "\(track.trackName) - \(track.artistName)"]
        if !track.artistName.isEmpty { query["artist"] = track.artistName }
        if let duration = track.duration { query["duration"] = String(Int(duration.rounded())) }
        let response: VideoResolution = try await get("music/search", query: query)
        return response.videoId
    }

    func lyrics(for track: Track) async throws -> LyricsResponse {
        var query = ["artist": track.artistName, "title": track.trackName]
        if let duration = track.duration { query["duration"] = String(Int(duration.rounded())) }
        return try await get("music/lyrics", query: query)
    }

    func translate(_ lines: [String], target: String) async throws -> TranslationResponse {
        try await post("music/translate", body: TranslationRequest(lines: lines, target: target))
    }

    func prewarm(videoId: String) async {
        let _: EmptyResponse? = try? await get("music/prewarm", query: ["id": videoId])
    }

    func audioURL(videoId: String) throws -> URL {
        try url("music/direct-audio", query: ["id": videoId])
    }

    func status() async throws {
        let _: StatusResponse = try await get("music/ai/status", query: [:])
    }

    private func get<T: Decodable>(_ path: String, query: [String: String]) async throws -> T {
        var request = URLRequest(url: try url(path, query: query))
        request.timeoutInterval = 30
        return try await send(request)
    }

    private func post<T: Decodable, Body: Encodable>(_ path: String, body: Body) async throws -> T {
        var request = URLRequest(url: try url(path, query: [:]))
        request.httpMethod = "POST"
        request.timeoutInterval = 30
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(body)
        return try await send(request)
    }

    private func send<T: Decodable>(_ request: URLRequest) async throws -> T {
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw MusicAPIError.invalidResponse }
        guard (200...299).contains(http.statusCode) else {
            let message = (try? JSONDecoder().decode(ErrorResponse.self, from: data).error) ?? ""
            throw MusicAPIError.requestFailed(http.statusCode, message)
        }
        return try JSONDecoder().decode(T.self, from: data)
    }

    private func url(_ path: String, query: [String: String]) throws -> URL {
        var components = URLComponents(url: baseURL.appending(path: path), resolvingAgainstBaseURL: false)
        components?.queryItems = query.map { URLQueryItem(name: $0.key, value: $0.value) }
        guard let result = components?.url else { throw MusicAPIError.invalidServer }
        return result
    }
}

private struct TranslationRequest: Encodable {
    let lines: [String]
    let target: String
}

private struct ErrorResponse: Decodable {
    let error: String
}

private struct EmptyResponse: Decodable {}

private struct StatusResponse: Decodable {
    let enabled: Bool
}
