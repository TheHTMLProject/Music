window.addEventListener('DOMContentLoaded', () => {
  /* Elements */
  const audioA = document.getElementById('audioPrimary')
  const audioB = document.getElementById('audioSecondary')
  let activeAudio = audioA
  let preloadAudio = audioB

  const playIcon = document.getElementById('playIcon')
  const favIcon = document.getElementById('favIcon')
  const volumeSlider = document.getElementById('volumeSlider')
  const muteBtn = document.getElementById('muteBtn')
  const muteIcon = document.getElementById('muteIcon')
  const shuffleIcon = document.getElementById('shuffleIcon')
  const repeatIcon = document.getElementById('repeatIcon')

  const songTitle = document.getElementById('songTitle')
  const artistName = document.getElementById('artistName')
  const statusText = document.getElementById('statusText')

  const albumArtContainer = document.getElementById('albumArtContainer')
  const bodyAmbient = document.getElementById('bodyAmbient')

  const favBtn = document.getElementById('favBtn')
  const prevBtn = document.getElementById('prevBtn')
  const playBtn = document.getElementById('playBtn')
  const nextBtn = document.getElementById('nextBtn')
  const shuffleBtn = document.getElementById('shuffleBtn')
  const repeatBtn = document.getElementById('repeatBtn')

  const progressBar = document.getElementById('progressBar')
  const progress = document.getElementById('progress')
  const progressThumb = document.getElementById('progressThumb')
  const currentTimeEl = document.getElementById('currentTime')
  const durationEl = document.getElementById('duration')

  const searchInput = document.getElementById('searchInput')
  const searchBtn = document.getElementById('searchBtn')
  const searchLoading = document.getElementById('searchLoading')
  const searchResults = document.getElementById('searchResults')

  const lyricsContainer = document.getElementById('lyricsContainer')
  const karaokeLines = document.getElementById('karaokeLines')
  const toggleSyncedLyrics = document.getElementById('toggleSyncedLyrics')
  const miniLyrics = document.getElementById('miniLyrics')

  const favoritesResults = document.getElementById('favoritesResults')
  const queueList = document.getElementById('queueList')
  const upNextList = document.getElementById('upNextList')

  const homeContinueList = document.getElementById('homeContinueList')
  const homeMixGrid = document.getElementById('homeMixGrid')
  const homeRadioGrid = document.getElementById('homeRadioGrid')

  const playlistsList = document.getElementById('playlistsList')
  const playlistDetailTracks = document.getElementById('playlistDetailTracks')
  const playlistDetailTitle = document.getElementById('playlistDetailTitle')
  const newPlaylistName = document.getElementById('newPlaylistName')
  const createPlaylistBtn = document.getElementById('createPlaylistBtn')
  const addCurrentToPlaylistBtn = document.getElementById('addCurrentToPlaylistBtn')

  const clearQueueBtn = document.getElementById('clearQueueBtn')
  const playNextFromFavsBtn = document.getElementById('playNextFromFavsBtn')

  /* State */
  const deepClone = (obj) => (typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj)))

  const defaultLibrary = {
    favorites: [],
    playlists: [],
    history: [],
    settings: {
      volume: 0.7,
      shuffle: false,
      repeat: 'off', // off | one | all
      crossfade: true,
      gapless: true
    }
  }

  let library = loadLibrary()
  let currentSong = null
  let queue = []
  let queueIndex = -1
  let isScrubbing = false
  let wasPlayingBeforeScrub = false
  let lastVolume = library.settings.volume ?? 0.7
  let crossfadeArmed = false
  let lyricState = { synced: [], plain: '', useSynced: true }
  let selectedPlaylistId = null

  /* Utilities */
  function fmtTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  function setStatus(text) {
    statusText.textContent = text || ''
  }

  function setArtwork(url) {
    albumArtContainer.innerHTML = ''
    if (!url) {
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined album-icon'
      icon.textContent = 'music_note'
      albumArtContainer.appendChild(icon)
      bodyAmbient.style.backgroundImage = ''
      bodyAmbient.classList.remove('active')
      return
    }
    const img = document.createElement('img')
    img.src = url
    img.alt = ''
    albumArtContainer.appendChild(img)
    bodyAmbient.style.backgroundImage = `url(\"${url}\")`
    bodyAmbient.classList.add('active')
  }

  function loadLibrary() {
    const raw = localStorage.getItem('music-library-v1')
    if (!raw) return deepClone(defaultLibrary)
    try {
      const parsed = JSON.parse(raw)
      return {
        ...deepClone(defaultLibrary),
        ...parsed,
        settings: { ...deepClone(defaultLibrary.settings), ...(parsed.settings || {}) }
      }
    } catch {
      return deepClone(defaultLibrary)
    }
  }

  function saveLibrary() {
    localStorage.setItem('music-library-v1', JSON.stringify(library))
  }

  function rememberHistory(song) {
    if (!song?.trackId) return
    library.history = [
      song,
      ...library.history.filter(s => s.trackId !== song.trackId)
    ].slice(0, 50)
    saveLibrary()
    renderHome()
  }

  function updateFavoriteIcon() {
    const fav = library.favorites.some(s => s.trackId === currentSong?.trackId)
    favIcon.textContent = fav ? 'favorite' : 'favorite_border'
    favBtn.classList.toggle('is-favorite', fav)
  }

  function buildSearchQueryFromSong(song) {
    const parts = []
    if (song.trackName) parts.push(song.trackName)
    if (song.artistName) parts.push(song.artistName)
    if (!parts.length && song.collectionName) parts.push(song.collectionName)
    return parts.join(' - ')
  }

  const videoIdCache = new Map()
  async function getVideoIdForSong(song) {
    if (!song) throw new Error('no-song')
    if (song.videoId) return song.videoId
    const cached = videoIdCache.get(song.trackId)
    if (cached) return cached
    const q = buildSearchQueryFromSong(song)
    if (!q) throw new Error('no-query')
    const res = await fetch(`/music/search?q=${encodeURIComponent(q)}`)
    if (!res.ok) throw new Error('search-failed')
    const data = await res.json()
    if (data?.videoId) {
      videoIdCache.set(song.trackId, data.videoId)
      song.videoId = data.videoId
      return data.videoId
    }
    throw new Error('no-video-id')
  }

  function buildAudioSrc(videoId) {
    return `/music/direct-audio?id=${encodeURIComponent(videoId)}`
  }

  async function prepareAudio(el, song, autoplay = false) {
    const vid = await getVideoIdForSong(song)
    el.src = buildAudioSrc(vid)
    el.load()
    el.dataset.trackId = song.trackId
    if (autoplay) {
      await el.play()
    }
    return vid
  }

  function swapPlayers() {
    const tmp = activeAudio
    activeAudio = preloadAudio
    preloadAudio = tmp
    const v = library.settings.volume ?? 0.7
    activeAudio.volume = v
    preloadAudio.volume = v
  }

  function preloadNextTrack() {
    if (!library.settings.gapless) return
    const next = getNextTrack()
    if (!next) {
      preloadAudio.removeAttribute('src')
      preloadAudio.dataset.trackId = ''
      return
    }
    getVideoIdForSong(next)
      .then((vid) => {
        preloadAudio.src = buildAudioSrc(vid)
        preloadAudio.load()
        preloadAudio.dataset.trackId = String(next.trackId || '')
      })
      .catch(() => {})
  }

  function handleCrossfade() {
    if (!library.settings.crossfade || !preloadAudio.src || !currentSong) return
    const next = getNextTrack()
    if (!next || preloadAudio.dataset.trackId !== next.trackId || preloadAudio.readyState < 2) return
    if (crossfadeArmed) return
    const remaining = activeAudio.duration - activeAudio.currentTime
    if (remaining <= 1.2 && remaining > 0) {
      crossfadeArmed = true
      preloadAudio.currentTime = 0
      preloadAudio.volume = activeAudio.volume
      preloadAudio.play().catch(() => {})
      const startVol = activeAudio.volume
      const start = performance.now()
      const duration = 1000
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration)
        activeAudio.volume = startVol * (1 - t)
        preloadAudio.volume = startVol * t
        if (t < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }
  }

  function getNextTrack() {
    if (!queue.length) return null
    if (library.settings.shuffle) {
      const choices = queue.filter((_, i) => i !== queueIndex)
      if (!choices.length) return queue[queueIndex]
      return choices[Math.floor(Math.random() * choices.length)]
    }
    const nextIndex = queueIndex + 1
    if (nextIndex < queue.length) return queue[nextIndex]
    if (library.settings.repeat === 'all') return queue[0]
    return null
  }

  function getNextIndex() {
    if (!queue.length) return -1
    if (library.settings.shuffle) {
      const indices = queue.map((_, i) => i).filter(i => i !== queueIndex)
      if (!indices.length) return queueIndex
      return indices[Math.floor(Math.random() * indices.length)]
    }
    const nextIndex = queueIndex + 1
    if (nextIndex < queue.length) return nextIndex
    if (library.settings.repeat === 'all') return 0
    return -1
  }

  function getPrevIndex() {
    if (!queue.length) return -1
    if (library.settings.shuffle) return queueIndex // keep as current reset
    const prevIndex = queueIndex - 1
    if (prevIndex >= 0) return prevIndex
    if (library.settings.repeat === 'all') return queue.length - 1
    return -1
  }

  function syncPlayUI() {
    const playing = !activeAudio.paused && !activeAudio.ended
    playIcon.textContent = playing ? 'pause' : 'play_arrow'
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play')
    shuffleBtn.classList.toggle('is-active', library.settings.shuffle)
    repeatBtn.classList.toggle('is-active', library.settings.repeat !== 'off')
    repeatIcon.textContent = library.settings.repeat === 'one' ? 'repeat_one' : 'repeat'
  }

  function updateMuteGlyph() {
    const muted = activeAudio.muted || activeAudio.volume === 0
    muteIcon.textContent = muted ? 'volume_off' : 'volume_up'
    muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute')
  }

  function updateVolumeSliderTrack() {
    const value = Math.max(0, Math.min(100, Number(volumeSlider.value)))
    const root = document.documentElement
    const track = getComputedStyle(root).getPropertyValue('--track-bg').trim() || '#888888'
    const brand = getComputedStyle(root).getPropertyValue('--brand').trim() || '#3cab64'
    volumeSlider.style.background = `linear-gradient(to right, ${brand} 0%, ${brand} ${value}%, ${track} ${value}%, ${track} 100%)`
  }

  function setVolumeFromSlider() {
    const v = Math.max(0, Math.min(1, Number(volumeSlider.value) / 100))
    activeAudio.volume = v
    preloadAudio.volume = v
    if (v > 0) lastVolume = v
    activeAudio.muted = v === 0
    preloadAudio.muted = v === 0
    library.settings.volume = v
    saveLibrary()
    updateMuteGlyph()
    updateVolumeSliderTrack()
  }

  function toggleMute() {
    if (!activeAudio.muted && activeAudio.volume > 0) {
      lastVolume = activeAudio.volume
      activeAudio.muted = true
      preloadAudio.muted = true
      activeAudio.volume = 0
      preloadAudio.volume = 0
      volumeSlider.value = 0
      updateMuteGlyph()
      updateVolumeSliderTrack()
      return
    }
    activeAudio.muted = false
    preloadAudio.muted = false
    const v = lastVolume > 0 ? lastVolume : 0.7
    activeAudio.volume = v
    preloadAudio.volume = v
    volumeSlider.value = Math.round(v * 100)
    updateMuteGlyph()
    updateVolumeSliderTrack()
  }

  function setProgressPct(pct) {
    const clamped = Math.min(100, Math.max(0, pct))
    progress.style.width = `${clamped}%`
    progressThumb.style.left = `${clamped}%`
  }

  function syncProgressUI() {
    const dur = activeAudio.duration
    const cur = activeAudio.currentTime
    durationEl.textContent = fmtTime(dur)
    currentTimeEl.textContent = fmtTime(cur)
    if (Number.isFinite(dur) && dur > 0) {
      const pct = (cur / dur) * 100
      setProgressPct(pct)
    } else {
      setProgressPct(0)
    }
  }

  function seekToClientX(clientX) {
    const dur = activeAudio.duration
    if (!Number.isFinite(dur) || dur <= 0) return
    const rect = progressBar.getBoundingClientRect()
    if (!rect.width) return
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const t = dur * pct
    activeAudio.currentTime = t
    currentTimeEl.textContent = fmtTime(t)
    setProgressPct(pct * 100)
  }

  function onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (!activeAudio.src) return
    e.preventDefault()
    isScrubbing = true
    wasPlayingBeforeScrub = !activeAudio.paused && !activeAudio.ended
    try { activeAudio.pause() } catch {}
    if (progressBar.setPointerCapture) {
      try { progressBar.setPointerCapture(e.pointerId) } catch {}
    }
    seekToClientX(e.clientX)
  }

  function onPointerMove(e) {
    if (!isScrubbing) return
    e.preventDefault()
    seekToClientX(e.clientX)
  }

  function onPointerUp(e) {
    if (!isScrubbing) return
    e.preventDefault()
    isScrubbing = false
    if (progressBar.releasePointerCapture) {
      try { progressBar.releasePointerCapture(e.pointerId) } catch {}
    }
    if (wasPlayingBeforeScrub) {
      activeAudio.play().catch(() => {})
    }
  }

  /* Lyrics */
  function parseLRC(lrc) {
    const lines = []
    const regex = /\\[(\\d{1,2}):(\\d{2})(?:\\.(\\d{1,3}))?](.*)/g
    const rows = lrc.split(/\\r?\\n/)
    rows.forEach(row => {
      let match
      while ((match = regex.exec(row)) !== null) {
        const m = Number(match[1])
        const s = Number(match[2])
        const ms = match[3] ? Number(match[3].padEnd(3, '0')) : 0
        const text = match[4]?.trim() || ''
        const timeMs = m * 60000 + s * 1000 + ms
        lines.push({ timeMs, text })
      }
    })
    return lines.sort((a, b) => a.timeMs - b.timeMs)
  }

  async function loadLyricsForSong(song) {
    lyricState = { synced: [], plain: '', useSynced: toggleSyncedLyrics.checked }
    karaokeLines.innerHTML = ''
    miniLyrics.textContent = 'Loading lyrics…'
    if (!song?.trackName || !song?.artistName) {
      miniLyrics.textContent = 'No lyrics available'
      lyricsContainer.classList.remove('has-lyrics')
      return
    }
    try {
      const res = await fetch(`/music/lyrics?artist=${encodeURIComponent(song.artistName)}&title=${encodeURIComponent(song.trackName)}`)
      if (!res.ok) throw new Error('lyrics-failed')
      const data = await res.json()
      lyricState.plain = data?.plainLyrics || ''
      lyricState.synced = data?.syncedLyrics ? parseLRC(data.syncedLyrics) : []
      renderLyrics()
    } catch {
      lyricState.plain = ''
      lyricState.synced = []
      renderLyrics()
    }
  }

  function renderLyrics() {
    karaokeLines.innerHTML = ''
    if (toggleSyncedLyrics.checked && lyricState.synced.length) {
      lyricsContainer.classList.add('has-lyrics')
      lyricState.synced.forEach((line, idx) => {
        const div = document.createElement('div')
        div.className = 'karaoke-line'
        div.dataset.index = idx
        div.textContent = line.text || ''
        karaokeLines.appendChild(div)
      })
    } else if (lyricState.plain) {
      lyricsContainer.classList.add('has-lyrics')
      const div = document.createElement('div')
      div.textContent = lyricState.plain
      div.style.whiteSpace = 'pre-wrap'
      karaokeLines.appendChild(div)
    } else {
      lyricsContainer.classList.remove('has-lyrics')
      karaokeLines.textContent = 'No lyrics available for this track'
    }
  }

  function tickLyrics() {
    if (!toggleSyncedLyrics.checked || !lyricState.synced.length || activeAudio.paused) {
      requestAnimationFrame(tickLyrics)
      return
    }
    const tMs = activeAudio.currentTime * 1000
    let activeIdx = -1
    for (let i = 0; i < lyricState.synced.length; i++) {
      if (tMs >= lyricState.synced[i].timeMs) activeIdx = i
      else break
    }
    if (activeIdx >= 0) {
      const nodes = karaokeLines.querySelectorAll('.karaoke-line')
      nodes.forEach((n, i) => n.classList.toggle('active', i === activeIdx))
      const line = lyricState.synced[activeIdx]
      miniLyrics.textContent = line?.text || ''
      const activeNode = nodes[activeIdx]
      if (activeNode) {
        activeNode.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    } else {
      miniLyrics.textContent = ''
    }
    requestAnimationFrame(tickLyrics)
  }

  /* Tabs */
  function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'))
    document.querySelectorAll('.top-nav-btn').forEach(b => b.classList.remove('active'))
    const panel = document.getElementById(tab + 'Tab')
    if (panel) panel.classList.add('active')
    const btn = document.querySelector(`[data-tab=\"${tab}\"]`)
    if (btn) btn.classList.add('active')
  }

  document.querySelectorAll('.top-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab))
  })

  /* Queue */
  function renderQueue() {
    queueList.innerHTML = ''
    queue.forEach((song, idx) => {
      const row = buildListRow(song, {
        showActions: true,
        playHandler: () => { queueIndex = idx; playSong(song) },
        removeHandler: () => { removeFromQueue(idx) },
        moveUp: () => moveQueueItem(idx, idx - 1),
        moveDown: () => moveQueueItem(idx, idx + 1)
      })
      if (idx === queueIndex) row.classList.add('is-current')
      queueList.appendChild(row)
    })
    renderUpNext()
  }

  function renderUpNext() {
    upNextList.innerHTML = ''
    queue.forEach((song, idx) => {
      if (idx <= queueIndex) return
      const row = buildListRow(song, {
        showActions: false,
        playHandler: () => { queueIndex = idx; playSong(song) }
      })
      upNextList.appendChild(row)
    })
  }

  function removeFromQueue(idx) {
    if (idx < 0 || idx >= queue.length) return
    queue.splice(idx, 1)
    if (queueIndex >= queue.length) queueIndex = queue.length - 1
    renderQueue()
  }

  function moveQueueItem(from, to) {
    if (to < 0 || to >= queue.length) return
    const [item] = queue.splice(from, 1)
    queue.splice(to, 0, item)
    if (queueIndex === from) queueIndex = to
    renderQueue()
  }

  function addToQueue(song) {
    queue.push(song)
    renderQueue()
  }

  function playNext(song) {
    queue.splice(queueIndex + 1, 0, song)
    renderQueue()
  }

  function clearQueue() {
    queue = []
    queueIndex = -1
    activeAudio.pause()
    preloadAudio.pause()
    activeAudio.removeAttribute('src')
    preloadAudio.removeAttribute('src')
    currentSong = null
    setArtwork('')
    songTitle.textContent = 'No Song Selected'
    artistName.textContent = 'Search for a song to play'
    renderQueue()
    renderUpNext()
  }

  function setQueue(list, startIndex = 0) {
    queue = list.slice()
    if (!queue.length) {
      clearQueue()
      return
    }
    queueIndex = Math.max(0, Math.min(startIndex, queue.length - 1))
    renderQueue()
    playSong(queue[queueIndex])
  }

  /* Favorites */
  function toggleFavorite() {
    if (!currentSong) return
    const i = library.favorites.findIndex(s => s.trackId === currentSong.trackId)
    if (i > -1) library.favorites.splice(i, 1)
    else library.favorites.unshift(currentSong)
    saveLibrary()
    updateFavoriteIcon()
    renderFavorites()
  }

  function renderFavorites() {
    favoritesResults.innerHTML = ''
    if (!library.favorites.length) {
      favoritesResults.classList.remove('has-items')
      favoritesResults.textContent = 'No favorites yet'
      return
    }
    favoritesResults.classList.add('has-items')
    library.favorites.forEach(song => {
      const row = buildListRow(song, {
        playHandler: () => { queueModeFromFavorites(); playSong(song) },
        removeHandler: () => {
          library.favorites = library.favorites.filter(s => s.trackId !== song.trackId)
          saveLibrary()
          updateFavoriteIcon()
          renderFavorites()
        },
        showActions: true
      })
      favoritesResults.appendChild(row)
    })
  }

  function queueModeFromFavorites() {
    queue = library.favorites.slice()
    queueIndex = queue.findIndex(s => s.trackId === currentSong?.trackId)
    renderQueue()
  }

  /* Playlists */
  function createPlaylist(name) {
    if (!name) return
    const id = (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16).slice(2))
    library.playlists.push({ id, name, tracks: [] })
    saveLibrary()
    renderPlaylists()
  }

  function addTrackToPlaylist(playlistId, track) {
    const pl = library.playlists.find(p => p.id === playlistId)
    if (!pl || !track) return
    if (!pl.tracks.some(t => t.trackId === track.trackId)) {
      pl.tracks.push(track)
      saveLibrary()
      renderPlaylistDetail(playlistId)
      renderPlaylists()
    }
  }

  function removeTrackFromPlaylist(playlistId, trackId) {
    const pl = library.playlists.find(p => p.id === playlistId)
    if (!pl) return
    pl.tracks = pl.tracks.filter(t => t.trackId !== trackId)
    saveLibrary()
    renderPlaylistDetail(playlistId)
    renderPlaylists()
  }

  function renderPlaylists() {
    playlistsList.innerHTML = ''
    library.playlists.forEach(pl => {
      const row = document.createElement('div')
      row.className = 'list-item'
      const art = document.createElement('div')
      art.className = 'mix-cover'
      art.style.background = gradientForId(pl.id)
      art.textContent = (pl.name || 'P')[0]?.toUpperCase() || 'P'
      const meta = document.createElement('div')
      meta.className = 'list-meta'
      const title = document.createElement('div')
      title.className = 'list-title'
      title.textContent = pl.name
      const sub = document.createElement('div')
      sub.className = 'list-subtitle'
      sub.textContent = `${pl.tracks.length} tracks`
      meta.appendChild(title)
      meta.appendChild(sub)
      const actions = document.createElement('div')
      actions.className = 'list-actions'
      const playBtnEl = document.createElement('button')
      playBtnEl.className = 'icon-btn'
      playBtnEl.innerHTML = '<span class=\"material-symbols-outlined\">play_arrow</span>'
      playBtnEl.addEventListener('click', e => {
        e.stopPropagation()
        if (pl.tracks.length) setQueue(pl.tracks, 0)
      })
      const deleteBtn = document.createElement('button')
      deleteBtn.className = 'icon-btn'
      deleteBtn.innerHTML = '<span class=\"material-symbols-outlined\">delete</span>'
      deleteBtn.addEventListener('click', e => {
        e.stopPropagation()
        library.playlists = library.playlists.filter(p => p.id !== pl.id)
        if (selectedPlaylistId === pl.id) {
          selectedPlaylistId = null
          playlistDetailTitle.textContent = 'Playlist'
          playlistDetailTracks.innerHTML = ''
        }
        saveLibrary()
        renderPlaylists()
      })
      actions.appendChild(playBtnEl)
      actions.appendChild(deleteBtn)
      row.appendChild(art)
      row.appendChild(meta)
      row.appendChild(actions)
      row.addEventListener('click', () => renderPlaylistDetail(pl.id))
      playlistsList.appendChild(row)
    })
  }

  function renderPlaylistDetail(id) {
    selectedPlaylistId = id
    const pl = library.playlists.find(p => p.id === id)
    playlistDetailTracks.innerHTML = ''
    if (!pl) {
      playlistDetailTitle.textContent = 'Playlist'
      return
    }
    playlistDetailTitle.textContent = pl.name
    pl.tracks.forEach((song, idx) => {
      const row = buildListRow(song, {
        showActions: true,
        playHandler: () => { queue = pl.tracks.slice(); queueIndex = idx; playSong(song) },
        removeHandler: () => removeTrackFromPlaylist(pl.id, song.trackId)
      })
      playlistDetailTracks.appendChild(row)
    })
  }

  /* Home */
  function renderHome() {
    renderContinueListening()
    renderMixes()
    renderQuickRadios()
  }

  function renderContinueListening() {
    homeContinueList.innerHTML = ''
    const items = library.history.slice(0, 10)
    if (!items.length) {
      homeContinueList.textContent = 'Play something to see it here'
      return
    }
    items.forEach(song => {
      const row = buildListRow(song, {
        playHandler: () => playSong(song),
        showActions: true
      })
      homeContinueList.appendChild(row)
    })
  }

  function renderMixes() {
    homeMixGrid.innerHTML = ''
    const base = library.history.slice(0, 30)
    const favs = library.favorites.slice(0, 20)
    const seeds = [...base, ...favs]
    if (!seeds.length) {
      homeMixGrid.textContent = 'Listen to a few songs to generate mixes'
      return
    }
    const artists = Array.from(new Set(seeds.map(s => s.artistName).filter(Boolean))).slice(0, 3)
    const mixes = artists.map((artist, idx) => ({
      id: `mix-${idx}`,
      title: `${artist} Mix`,
      tracks: seeds.filter(s => s.artistName === artist)
    }))
    if (!mixes.length) {
      mixes.push({ id: 'mix-generic', title: 'Daily Mix', tracks: seeds.slice(0, 20) })
    }
    mixes.forEach(mix => {
      const card = document.createElement('div')
      card.className = 'mix-card'
      card.style.background = gradientForId(mix.id)
      const title = document.createElement('div')
      title.className = 'mix-title'
      title.textContent = mix.title
      const count = document.createElement('div')
      count.className = 'mix-sub'
      count.textContent = `${mix.tracks.length} tracks`
      const playBtnEl = document.createElement('button')
      playBtnEl.type = 'button'
      playBtnEl.className = 'mix-play'
      playBtnEl.innerHTML = '<span class=\"material-symbols-outlined\">play_arrow</span>'
      playBtnEl.addEventListener('click', e => {
        e.stopPropagation()
        if (mix.tracks.length) setQueue(mix.tracks, 0)
      })
      card.appendChild(title)
      card.appendChild(count)
      card.appendChild(playBtnEl)
      homeMixGrid.appendChild(card)
    })
  }

  function renderQuickRadios() {
    homeRadioGrid.innerHTML = ''
    const seeds = [
      { label: 'Chill', q: 'chill lofi beats' },
      { label: 'Focus', q: 'focus ambient study music' },
      { label: 'Energy', q: 'upbeat pop hits' }
    ]
    seeds.forEach(seed => {
      const card = document.createElement('div')
      card.className = 'radio-pill'
      card.textContent = seed.label
      card.addEventListener('click', () => startRadio(seed.q))
      homeRadioGrid.appendChild(card)
    })
  }

  /* List Row Factory */
  function buildListRow(song, opts = {}) {
    const row = document.createElement('div')
    row.className = 'list-item'
    const art = document.createElement('img')
    art.className = 'list-art'
    art.src = song.artworkUrl60 || song.artworkUrl100 || ''
    art.alt = ''

    const meta = document.createElement('div')
    meta.className = 'list-meta'
    const title = document.createElement('div')
    title.className = 'list-title'
    title.textContent = song.trackName || 'Unknown'
    const sub = document.createElement('div')
    sub.className = 'list-subtitle'
    sub.textContent = song.artistName || ''
    meta.appendChild(title)
    meta.appendChild(sub)

    const actions = document.createElement('div')
    actions.className = 'list-actions'

    if (opts.showActions) {
      const play = document.createElement('button')
      play.className = 'icon-btn'
      play.innerHTML = '<span class=\"material-symbols-outlined\">play_arrow</span>'
      play.addEventListener('click', e => { e.stopPropagation(); opts.playHandler?.() })
      actions.appendChild(play)

      const playNextBtn = document.createElement('button')
      playNextBtn.className = 'icon-btn'
      playNextBtn.innerHTML = '<span class=\"material-symbols-outlined\">skip_next</span>'
      playNextBtn.addEventListener('click', e => { e.stopPropagation(); playNext(song) })
      actions.appendChild(playNextBtn)

      const addQ = document.createElement('button')
      addQ.className = 'icon-btn'
      addQ.innerHTML = '<span class=\"material-symbols-outlined\">add</span>'
      addQ.addEventListener('click', e => { e.stopPropagation(); addToQueue(song) })
      actions.appendChild(addQ)

      const fav = document.createElement('button')
      fav.className = 'icon-btn'
      fav.innerHTML = '<span class=\"material-symbols-outlined\">favorite</span>'
      fav.addEventListener('click', e => {
        e.stopPropagation()
        if (!library.favorites.some(f => f.trackId === song.trackId)) {
          library.favorites.unshift(song)
          saveLibrary()
          renderFavorites()
        }
      })
      actions.appendChild(fav)

      if (opts.removeHandler) {
        const del = document.createElement('button')
        del.className = 'icon-btn'
        del.innerHTML = '<span class=\"material-symbols-outlined\">delete</span>'
        del.addEventListener('click', e => { e.stopPropagation(); opts.removeHandler() })
        actions.appendChild(del)
      }
      if (opts.moveUp) {
        const up = document.createElement('button')
        up.className = 'icon-btn'
        up.innerHTML = '<span class=\"material-symbols-outlined\">keyboard_arrow_up</span>'
        up.addEventListener('click', e => { e.stopPropagation(); opts.moveUp() })
        actions.appendChild(up)
      }
      if (opts.moveDown) {
        const down = document.createElement('button')
        down.className = 'icon-btn'
        down.innerHTML = '<span class=\"material-symbols-outlined\">keyboard_arrow_down</span>'
        down.addEventListener('click', e => { e.stopPropagation(); opts.moveDown() })
        actions.appendChild(down)
      }
    }

    row.appendChild(art)
    row.appendChild(meta)
    row.appendChild(actions)
    row.addEventListener('click', () => opts.playHandler?.())
    return row
  }

  /* Search */
  function renderSearch(songs) {
    searchResults.innerHTML = ''
    songs.forEach(song => {
      const row = buildListRow(song, {
        showActions: true,
        playHandler: () => { queue = songs.slice(); queueIndex = songs.findIndex(s => s.trackId === song.trackId); playSong(song) }
      })
      const radioBtn = document.createElement('button')
      radioBtn.className = 'icon-btn'
      radioBtn.innerHTML = '<span class=\"material-symbols-outlined\">podcasts</span>'
      radioBtn.addEventListener('click', e => { e.stopPropagation(); startRadio(buildSearchQueryFromSong(song) + ' official audio') })
      row.querySelector('.list-actions')?.appendChild(radioBtn)
      searchResults.appendChild(row)
    })
  }

  function searchSongs() {
    const q = searchInput.value.trim()
    if (!q) return
    searchLoading.classList.add('active')
    searchResults.innerHTML = ''
    fetch(`/music/meta?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => {
        const items = Array.isArray(d.results) ? d.results : []
        queue = items
        queueIndex = -1
        renderSearch(items)
      })
      .catch(() => {
        queue = []
        searchResults.innerHTML = ''
      })
      .finally(() => {
        searchLoading.classList.remove('active')
      })
  }

  /* Radio */
  function startRadio(query) {
    if (!query) return
    setStatus('Starting radio…')
    fetch(`/music/radio?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(d => {
        const items = Array.isArray(d.results) ? d.results : []
        if (!items.length) throw new Error('no-radio')
        setQueue(items, 0)
        showTab('player')
      })
      .catch(() => {
        setStatus('Unable to start radio')
      })
  }

  /* Playback */
  async function playSong(song) {
    if (!song) return
    if (!queue.some(s => s.trackId === song.trackId)) {
      queue.push(song)
      queueIndex = queue.length - 1
      renderQueue()
    }
    setStatus('Loading…')
    crossfadeArmed = false
    activeAudio.pause()
    activeAudio.removeAttribute('src')
    activeAudio.load()
    currentSong = song
    queueIndex = queue.findIndex(s => s.trackId === song.trackId)
    applySongUI(song)
    syncPlayUI()

    try {
      await prepareAudio(activeAudio, song, true)
      setStatus('')
      syncPlayUI()
      preloadNextTrack()
    } catch (e) {
      setStatus('Unable to play this track')
      activeAudio.pause()
      activeAudio.removeAttribute('src')
      activeAudio.load()
      syncPlayUI()
    }
  }

  function applySongUI(song) {
    songTitle.textContent = song.trackName || 'Unknown'
    artistName.textContent = song.artistName || ''
    setArtwork(song.artworkUrl100 || song.artworkUrl60 || '')
    updateFavoriteIcon()
    renderUpNext()
    rememberHistory(song)
    loadLyricsForSong(song)
  }

  function togglePlay() {
    if (!activeAudio.src) return
    if (activeAudio.paused) activeAudio.play().catch(() => {})
    else activeAudio.pause()
    syncPlayUI()
  }

  function prevSong() {
    if (!queue.length) return
    if (activeAudio.currentTime > 3) {
      activeAudio.currentTime = 0
      return
    }
    const prevIdx = getPrevIndex()
    if (prevIdx === -1) return
    const s = queue[prevIdx]
    if (s) playSong(s)
  }

  function nextSong(force = false) {
    if (library.settings.repeat === 'one' && !force) {
      activeAudio.currentTime = 0
      activeAudio.play().catch(() => {})
      return
    }
    const nextIdx = getNextIndex()
    if (nextIdx === -1) {
      activeAudio.pause()
      return
    }
    const s = queue[nextIdx]
    if (s) playSong(s)
  }

  /* Events */
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchSongs()
  })
  searchBtn.addEventListener('click', searchSongs)

  favBtn.addEventListener('click', toggleFavorite)
  playBtn.addEventListener('click', togglePlay)
  prevBtn.addEventListener('click', prevSong)
  nextBtn.addEventListener('click', () => nextSong(true))
  shuffleBtn.addEventListener('click', () => {
    library.settings.shuffle = !library.settings.shuffle
    saveLibrary()
    syncPlayUI()
    renderUpNext()
  })
  repeatBtn.addEventListener('click', () => {
    const order = ['off', 'all', 'one']
    const idx = order.indexOf(library.settings.repeat)
    library.settings.repeat = order[(idx + 1) % order.length]
    saveLibrary()
    syncPlayUI()
  })

  muteBtn.addEventListener('click', toggleMute)
  volumeSlider.addEventListener('input', setVolumeFromSlider)

  function handlePlayPause(e) {
    if (e.target !== activeAudio) return
    syncPlayUI()
  }

  function handleEnded(e) {
    if (e.target !== activeAudio) return
    syncPlayUI()
    crossfadeArmed = false
    const expected = getNextTrack()
    const nextIdx = getNextIndex()
    if (expected && preloadAudio.dataset.trackId === String(expected.trackId || '') && preloadAudio.readyState >= 2) {
      // Seamless swap
      swapPlayers()
      currentSong = expected
      if (nextIdx >= 0) queueIndex = nextIdx
      applySongUI(currentSong)
      activeAudio.play().catch(() => {})
      preloadNextTrack()
      return
    }
    nextSong()
  }

  function handleTime(e) {
    if (e.target !== activeAudio) return
    if (!isScrubbing) {
      syncProgressUI()
      handleCrossfade()
    }
  }

  function handleMetadata(e) {
    if (e.target !== activeAudio) return
    syncProgressUI()
  }

  function handleVolume(e) {
    if (e.target !== activeAudio) return
    updateMuteGlyph()
    updateVolumeSliderTrack()
  }

  function handleError(e) {
    if (e.target !== activeAudio) return
    if (activeAudio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      setStatus('Unable to play this track')
      syncPlayUI()
    }
  }

  function attachAudioListeners(el) {
    el.addEventListener('play', handlePlayPause)
    el.addEventListener('playing', handlePlayPause)
    el.addEventListener('pause', handlePlayPause)
    el.addEventListener('ended', handleEnded)
    el.addEventListener('timeupdate', handleTime)
    el.addEventListener('loadedmetadata', handleMetadata)
    el.addEventListener('durationchange', handleMetadata)
    el.addEventListener('volumechange', handleVolume)
    el.addEventListener('error', handleError)
  }

  attachAudioListeners(audioA)
  attachAudioListeners(audioB)

  progressBar.addEventListener('pointerdown', onPointerDown)
  progressBar.addEventListener('pointermove', onPointerMove)
  progressBar.addEventListener('pointerup', onPointerUp)
  progressBar.addEventListener('pointercancel', onPointerUp)

  toggleSyncedLyrics?.addEventListener('change', () => {
    lyricState.useSynced = toggleSyncedLyrics.checked
    renderLyrics()
  })

  clearQueueBtn?.addEventListener('click', clearQueue)
  playNextFromFavsBtn?.addEventListener('click', () => {
    library.favorites.forEach(f => playNext(f))
    renderQueue()
  })

  createPlaylistBtn?.addEventListener('click', () => {
    const name = newPlaylistName.value.trim()
    if (!name) return
    createPlaylist(name)
    newPlaylistName.value = ''
  })

  addCurrentToPlaylistBtn?.addEventListener('click', () => {
    if (!currentSong) return
    const targetId = selectedPlaylistId || library.playlists[0]?.id
    if (!targetId) return
    addTrackToPlaylist(targetId, currentSong)
    renderPlaylistDetail(targetId)
  })

  /* Init */
  volumeSlider.value = Math.round((library.settings.volume ?? 0.7) * 100)
  activeAudio.volume = library.settings.volume ?? 0.7
  preloadAudio.volume = activeAudio.volume
  updateMuteGlyph()
  updateVolumeSliderTrack()
  updateFavoriteIcon()
  setArtwork('')
  setStatus('')
  setProgressPct(0)
  renderFavorites()
  renderPlaylists()
  renderHome()
  syncPlayUI()
  tickLyrics()
})

function gradientForId(id) {
  const seed = Array.from(id || '').reduce((a, c) => a + c.charCodeAt(0), 0)
  const hue = seed % 360
  const hue2 = (hue + 40) % 360
  return `linear-gradient(135deg, hsl(${hue},70%,60%), hsl(${hue2},70%,50%))`
}
