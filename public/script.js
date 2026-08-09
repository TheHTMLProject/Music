window.addEventListener('DOMContentLoaded', () => {

  const $ = (id) => document.getElementById(id)

  const audioA = $('audioPrimary')
  const audioB = $('audioSecondary')
  let activeAudio = audioA
  let preloadAudio = audioB

  const ambient = $('ambient')
  const navRail = $('navRail')
  const railToggle = $('railToggle')
  const railBrand = $('railBrand')
  const railWaveform = $('railWaveform')
  const queueBadge = $('queueBadge')
  const topBar = $('topBar')
  const topSearch = $('topSearch')

  const viewTitle = $('viewTitle')
  const viewSubtitle = $('viewSubtitle')

  const searchInput = $('searchInput')
  const searchBtn = $('searchBtn')
  const searchClear = $('searchClear')
  const searchSuggestions = $('searchSuggestions')
  const searchLoading = $('searchLoading')
  const searchEmpty = $('searchEmpty')
  const searchResults = $('searchResults')
  const searchFilters = $('searchFilters')

  const heroEyebrow = $('heroEyebrow')
  const heroTitle = $('heroTitle')
  const heroSub = $('heroSub')
  const heroArt = $('heroArt')
  const heroPlayBtn = $('heroPlayBtn')
  const heroSearchBtn = $('heroSearchBtn')
  const homeContinueGrid = $('homeContinueGrid')
  const homeMixGrid = $('homeMixGrid')
  const homeRadioGrid = $('homeRadioGrid')
  const continueNote = $('continueNote')

  const albumArtContainer = $('albumArtContainer')
  const songTitle = $('songTitle')
  const artistName = $('artistName')
  const statusText = $('statusText')
  const favChip = $('favChip')
  const favChipIcon = $('favChipIcon')
  const radioChip = $('radioChip')
  const addPlaylistChip = $('addPlaylistChip')
  const nowPlayingGrid = $('nowPlayingGrid')
  const nowLyricsPanel = $('nowLyricsPanel')
  const upNextPanel = $('upNextPanel')
  const upNextToggleChip = $('upNextToggleChip')
  const upNextToggleLabel = $('upNextToggleLabel')
  const fullscreenLyricsToggle = $('fullscreenLyricsToggle')
  const fullscreenLyricsLabel = $('fullscreenLyricsLabel')
  const upNextList = $('upNextList')
  const openQueueBtn = $('openQueueBtn')

  const lyricsBadge = $('lyricsBadge')
  const nowLyricsScroll = $('nowLyricsScroll')
  const nowLyricsLines = $('nowLyricsLines')
  const nowLyricsEmpty = $('nowLyricsEmpty')
  const lyricsScroll = $('lyricsScroll')
  const lyricsLines = $('lyricsLines')
  const lyricsEmpty = $('lyricsEmpty')
  const lyricsArt = $('lyricsArt')
  const lyricsTitle = $('lyricsTitle')
  const lyricsArtist = $('lyricsArtist')
  const lyricsSyncToggle = $('lyricsSyncToggle')
  const lyricsSizeToggle = $('lyricsSizeToggle')
  const lyricsHint = $('lyricsHint')
  const lyricsTranslateToggle = $('lyricsTranslateToggle')
  const lyricsTranslateLabel = $('lyricsTranslateLabel')

  const artistResults = $('artistResults')
  const playlistResults = $('playlistResults')
  const playlistScope = $('playlistScope')
  const communityToggle = $('communityToggle')
  const endlessBtn = $('endlessBtn')
  const endlessMark = $('endlessMark')
  const aiQueueBtn = $('aiQueueBtn')
  const refreshMixesBtn = $('refreshMixesBtn')

  const queueList = $('queueList')
  const clearQueueBtn = $('clearQueueBtn')
  const playNextFromFavsBtn = $('playNextFromFavsBtn')
  const shuffleQueueBtn = $('shuffleQueueBtn')

  const playlistsList = $('playlistsList')
  const playlistsEmpty = $('playlistsEmpty')
  const playlistsWorkspace = $('playlistsWorkspace')
  const playlistDetailTracks = $('playlistDetailTracks')
  const playlistDetailTitle = $('playlistDetailTitle')
  const playlistDetailDescription = $('playlistDetailDescription')
  const playlistDetailCover = $('playlistDetailCover')
  const createPlaylistBtn = $('createPlaylistBtn')
  const createFirstPlaylistBtn = $('createFirstPlaylistBtn')
  const addCurrentToPlaylistBtn = $('addCurrentToPlaylistBtn')

  const favoritesGrid = $('favoritesGrid')
  const favoritesEmpty = $('favoritesEmpty')

  const nowArt = $('nowArt')
  const nowTitle = $('nowTitle')
  const nowArtist = $('nowArtist')
  const favBtn = $('favBtn')
  const favIcon = $('favIcon')
  const playBtn = $('playBtn')
  const playIcon = $('playIcon')
  const prevBtn = $('prevBtn')
  const nextBtn = $('nextBtn')
  const shuffleBtn = $('shuffleBtn')
  const shuffleIcon = $('shuffleIcon')
  const repeatBtn = $('repeatBtn')
  const repeatIcon = $('repeatIcon')
  const miniLyricsBtn = $('miniLyricsBtn')
  const miniQueueBtn = $('miniQueueBtn')
  const muteBtn = $('muteBtn')
  const muteIcon = $('muteIcon')
  const volumeSlider = $('volumeSlider')
  const expandBtn = $('expandBtn')
  const expandIcon = $('expandIcon')
  const fullscreenChip = $('fullscreenChip')
  const fullscreenIcon = $('fullscreenIcon')
  const fullscreenLabel = $('fullscreenLabel')

  const progressBar = $('progressBar')
  const progress = $('progress')
  const progressThumb = $('progressThumb')
  const currentTimeEl = $('currentTime')
  const durationEl = $('duration')

  const toast = $('toast')
  const playlistSheet = $('playlistSheet')
  const sheetPlaylists = $('sheetPlaylists')
  const sheetClose = $('sheetClose')
  const playlistCreateSheet = $('playlistCreateSheet')
  const playlistCreateClose = $('playlistCreateClose')
  const playlistCreateCancel = $('playlistCreateCancel')
  const playlistCreateSave = $('playlistCreateSave')
  const playlistCreateName = $('playlistCreateName')
  const playlistCreateDescription = $('playlistCreateDescription')
  const playlistImageChoose = $('playlistImageChoose')
  const playlistImageInput = $('playlistImageInput')
  const playlistImagePreview = $('playlistImagePreview')
  const playlistImageGlyph = $('playlistImageGlyph')
  const playlistCreateTracks = $('playlistCreateTracks')
  const playlistSelectionCount = $('playlistSelectionCount')

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  const deepClone = (obj) => (typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj)))

  const defaultLibrary = {
    favorites: [],
    playlists: [],
    history: [],
    settings: {
      volume: 1,
      shuffle: false,
      repeat: 'off',
      crossfade: true,
      gapless: true,
      railExpanded: false,
      syncedLyrics: true,
      lyricsCompact: false,
      translateLyrics: false,
      translateTarget: '',
      endless: true,
      includeCommunity: false,
      muted: false,
      showUpNext: true,
      fullscreenLyrics: true
    }
  }

  let library = loadLibrary()
  let currentSong = null
  let queue = []
  let queueIndex = -1
  let isScrubbing = false
  let wasPlayingBeforeScrub = false
  let lastVolume = library.settings.volume ?? 1
  let crossfadeArmed = false
  let selectedPlaylistId = null
  let plannedNext = null
  let prewarmedId = null
  const PRESTREAM_LEAD_SECONDS = 12
  let lastResults = []
  let lastQuery = ''
  let pendingPlaylistTrack = null
  let toastTimer = null
  let currentView = 'home'
  let previousView = 'home'
  let aiEnabled = false
  let aiBusy = false
  let searchFacets = { songs: [], artists: [], playlists: [] }
  let activeFacet = 'songs'
  let playlistScopeValue = 'personal'
  let openMenu = null
  let playlistDraftPicture = ''
  let playlistDraftTracks = []
  let playlistDraftSelection = new Set()
  let suggestionTimer = null
  let suggestionRequest = null
  let suggestionItems = []
  let suggestionIndex = -1

  const AI_REFILL_THRESHOLD = 3
  const AI_REFILL_COUNT = 10
  const QUEUE_LOOKAHEAD = 15
  const CANDIDATE_TTL_MS = 10 * 60 * 1000

  let candidatePool = { key: '', tracks: [], at: 0 }
  let topUpBusy = false
  let queueContext = { source: 'manual', finiteEnd: -1, phase: 'algorithm', algorithmContext: [], algorithmPool: [], aiPool: [] }
  let sessionTrackKeys = new Set()
  let sessionSongs = []
  let invidiousUrl = ''
  let waveformContext = null
  let waveformAnalyser = null
  let waveformData = null
  let waveformSources = new WeakMap()
  let waveformChecks = new WeakMap()
  let waveformFrame = 0
  let waveformLastSignal = 0
  let waveformLastDraw = 0

  const WAVEFORM_IDLE_MS = 90 * 1000
  const WAVEFORM_LEVEL_FLOOR = 0.05
  const WAVEFORM_LEVEL_CURVE = 1.8
  const WAVEFORM_LEVEL_GAIN = 1.125
  const WAVEFORM_BAND_GAINS = [0.4, 0.55, 0.90, 0.90, 0.90]

  const VIEW_META = {
    home: { title: 'Home', subtitle: 'Everything you have been listening to' },
    search: { title: 'Search', subtitle: 'Find songs across the catalog and YouTube' },
    player: { title: 'Now Playing', subtitle: 'Artwork, live lyrics and what comes next' },
    lyrics: { title: 'Lyrics', subtitle: 'Time synced words for the current track' },
    queue: { title: 'Queue', subtitle: 'Reorder what plays next' },
    playlists: { title: 'Playlists', subtitle: 'Collections saved on this device' },
    favorites: { title: 'Favorites', subtitle: 'Tracks you marked as favorites' }
  }


  function fmtTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  function isExplicitTrack(song) {
    if (!song) return false
    if (song.explicit === true || song.isExplicit === true) return true
    const ratings = [song.trackExplicitness, song.collectionExplicitness, song.contentAdvisoryRating]
    return ratings.some(value => String(value || '').toLowerCase() === 'explicit')
  }

  function setTrackTitle(container, text, song) {
    container.textContent = ''
    const copy = document.createElement('span')
    copy.className = 'track-title-copy'
    copy.textContent = text
    container.appendChild(copy)
    if (!isExplicitTrack(song)) return
    const badge = document.createElement('span')
    badge.className = 'explicit-badge'
    badge.textContent = 'E'
    badge.title = 'Explicit'
    badge.setAttribute('aria-label', 'Explicit')
    container.appendChild(badge)
  }

  function setStatus(text) {
    statusText.textContent = text || ''
  }

  function showToast(message, action) {
    if (!message) return
    toast.innerHTML = ''

    const label = document.createElement('span')
    label.textContent = message
    toast.appendChild(label)

    if (action?.label) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'toast-action'
      btn.textContent = action.label
      btn.addEventListener('click', () => {
        action.run()
        toast.classList.remove('is-visible')
        setTimeout(() => { toast.hidden = true }, 260)
      })
      toast.appendChild(btn)
    }

    toast.hidden = false
    toast.style.pointerEvents = action ? 'auto' : 'none'
    requestAnimationFrame(() => toast.classList.add('is-visible'))
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible')
      setTimeout(() => { toast.hidden = true }, 260)
    }, action ? 9000 : 2600)
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
    try {
      localStorage.setItem('music-library-v1', JSON.stringify(library))
    } catch {
      showToast('Storage is full, changes may not persist')
    }
  }

  function upscaleArtwork(url, size) {
    if (!url) return ''
    return String(url).replace(/\/\d{2,4}x\d{2,4}(bb)?\.(jpg|png|jpeg)/i, `/${size}x${size}bb.$2`)
  }

  function artFor(song, large) {
    if (!song) return ''
    if (large) return upscaleArtwork(song.artworkUrl100 || song.artworkUrl60 || '', 600)
    return song.artworkUrl60 || song.artworkUrl100 || ''
  }

  function isFavorite(song) {
    return Boolean(song) && library.favorites.some(s => s.trackId === song.trackId)
  }

  function gradientForId(id) {
    const seed = Array.from(String(id || '')).reduce((a, c) => a + c.charCodeAt(0), 0)
    const hue = seed % 360
    const hue2 = (hue + 40) % 360
    return `linear-gradient(135deg, hsl(${hue},58%,46%), hsl(${hue2},62%,34%))`
  }


  function showTab(tab) {
    const meta = VIEW_META[tab]
    if (!meta) return
    if (tab === 'player' && currentView !== 'player') previousView = currentView
    currentView = tab
    const searchless = tab === 'player' || tab === 'playlists'
    topBar.classList.toggle('is-searchless', searchless)
    topSearch.setAttribute('aria-hidden', String(searchless))
    expandBtn.classList.toggle('is-expanded', tab === 'player')
    expandBtn.setAttribute('aria-label', tab === 'player' ? 'Collapse now playing' : 'Expand to now playing')
    document.querySelectorAll('.view').forEach(v => v.classList.remove('is-active'))
    document.querySelectorAll('.rail-item[data-tab]').forEach(b => b.classList.remove('is-active'))
    const view = $(tab + 'View')
    if (view) view.classList.add('is-active')
    const btn = document.querySelector(`.rail-item[data-tab="${tab}"]`)
    if (btn) btn.classList.add('is-active')
    viewTitle.textContent = meta.title
    viewSubtitle.textContent = meta.subtitle
    if (tab === 'lyrics' || tab === 'player') {
      requestAnimationFrame(() => {
        updateLyricPadding()
        recenterLyrics(true)
      })
    }
    if (tab === 'search') searchInput.focus()
  }

  document.querySelectorAll('.rail-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab))
  })

  function applyRailState() {
    const expanded = Boolean(library.settings.railExpanded)
    navRail.classList.toggle('is-expanded', expanded)
    railToggle.setAttribute('aria-expanded', String(expanded))
    railToggle.setAttribute('aria-label', expanded ? 'Collapse navigation' : 'Expand navigation')
  }

  railToggle.addEventListener('click', () => {
    library.settings.railExpanded = !library.settings.railExpanded
    saveLibrary()
    applyRailState()
  })


  function setArtwork(url) {
    albumArtContainer.innerHTML = ''
    nowArt.innerHTML = ''

    if (!url) {
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined np-art-icon'
      icon.textContent = 'music_note'
      albumArtContainer.appendChild(icon)

      const mini = document.createElement('span')
      mini.className = 'material-symbols-outlined'
      mini.textContent = 'music_note'
      nowArt.appendChild(mini)

      ambient.style.backgroundImage = ''
      ambient.classList.remove('is-active')
      lyricsArt.hidden = true
      return
    }

    const big = document.createElement('img')
    big.src = url
    big.alt = ''
    big.loading = 'lazy'
    albumArtContainer.appendChild(big)

    const small = document.createElement('img')
    small.src = url
    small.alt = ''
    nowArt.appendChild(small)

    lyricsArt.src = url
    lyricsArt.hidden = false

    ambient.style.backgroundImage = `url("${url}")`
    ambient.classList.add('is-active')
  }

  function updateFavoriteUI() {
    const fav = isFavorite(currentSong)
    favIcon.style.fontVariationSettings = fav ? "'FILL' 1" : "'FILL' 0"
    favBtn.classList.toggle('is-favorite', fav)
    favBtn.setAttribute('aria-label', fav ? 'Remove from favorites' : 'Add to favorites')
    favChip.classList.toggle('is-active', fav)
    favChipIcon.textContent = fav ? 'favorite' : 'favorite_border'
  }

  function rememberHistory(song) {
    if (!song?.trackId) return
    library.history = [song, ...library.history.filter(s => s.trackId !== song.trackId)].slice(0, 60)
    saveLibrary()
    renderHome()
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
    const params = new URLSearchParams({ q })
    if (song.artistName) params.set('artist', song.artistName)
    const ms = Number(song.trackTimeMillis)
    if (Number.isFinite(ms) && ms > 0) params.set('duration', String(Math.round(ms / 1000)))
    const res = await fetch(`/music/search?${params.toString()}`)
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
    resetWaveformAudio(el)
    el.dataset.trackId = String(song.trackId || '')
    el.src = buildAudioSrc(vid)
    el.load()
    if (autoplay) await el.play()
    return vid
  }

  function swapPlayers() {
    const tmp = activeAudio
    activeAudio = preloadAudio
    preloadAudio = tmp
    applyAudioVolumeState()
    ensureWaveformAudio(activeAudio)
  }

  function preloadNextTrack() {
    if (!library.settings.gapless) return
    const next = getNextTrack()
    if (!next) {
      resetWaveformAudio(preloadAudio)
      preloadAudio.removeAttribute('src')
      preloadAudio.dataset.trackId = ''
      prewarmedId = null
      return
    }
    if (preloadAudio.dataset.trackId === String(next.trackId || '') && preloadAudio.readyState >= 2) return

    getVideoIdForSong(next)
      .then((vid) => {
        if (prewarmedId !== vid) {
          prewarmedId = vid
          fetch(`/music/prewarm?id=${encodeURIComponent(vid)}`).catch(() => {})
        }
        preloadAudio.preload = 'auto'
        resetWaveformAudio(preloadAudio)
        preloadAudio.dataset.trackId = String(next.trackId || '')
        preloadAudio.src = buildAudioSrc(vid)
        preloadAudio.load()
      })
      .catch(() => {})
  }

  function ensureNextReady() {
    if (!library.settings.gapless) return
    const dur = activeAudio.duration
    if (!Number.isFinite(dur) || dur <= 0) return
    const remaining = dur - activeAudio.currentTime
    if (remaining > PRESTREAM_LEAD_SECONDS || remaining <= 0) return

    const next = getNextTrack()
    if (!next) return
    const matches = preloadAudio.dataset.trackId === String(next.trackId || '')
    if (!matches || preloadAudio.readyState < 3) preloadNextTrack()
  }

  function handleCrossfade() {
    if (!library.settings.crossfade || !preloadAudio.src || !currentSong) return
    const next = getNextTrack()
    if (!next || preloadAudio.dataset.trackId !== String(next.trackId || '') || preloadAudio.readyState < 2) return
    if (crossfadeArmed) return
    const remaining = activeAudio.duration - activeAudio.currentTime
    if (remaining <= 1.2 && remaining > 0) {
      crossfadeArmed = true
      preloadAudio.currentTime = 0
      preloadAudio.volume = activeAudio.volume
      preloadAudio.muted = activeAudio.muted
      preloadAudio.play().catch(() => {})
      const startVol = activeAudio.volume
      const start = performance.now()
      const step = (now) => {
        const t = Math.min(1, (now - start) / 1000)
        activeAudio.volume = startVol * (1 - t)
        preloadAudio.volume = startVol * t
        if (t < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }
  }

  function computeNextIndex() {
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

  function planNextTrack() {
    const idx = computeNextIndex()
    plannedNext = idx === -1 || !queue[idx] ? null : { index: idx, song: queue[idx] }
    return plannedNext
  }

  function getPlannedNext() {
    if (plannedNext && queue[plannedNext.index]?.trackId === plannedNext.song?.trackId) return plannedNext
    return planNextTrack()
  }

  function getNextIndex() {
    const planned = getPlannedNext()
    return planned ? planned.index : -1
  }

  function getNextTrack() {
    const planned = getPlannedNext()
    return planned ? planned.song : null
  }

  function invalidateNextPlan() {
    plannedNext = null
    prewarmedId = null
  }

  function getPrevIndex() {
    if (!queue.length) return -1
    if (library.settings.shuffle) return queueIndex
    const prevIndex = queueIndex - 1
    if (prevIndex >= 0) return prevIndex
    if (library.settings.repeat === 'all') return queue.length - 1
    return -1
  }

  let lastPlayingState = null
  let morphTimer = null

  function syncPlayUI() {
    const playing = !activeAudio.paused && !activeAudio.ended

    if (playing !== lastPlayingState) {
      lastPlayingState = playing
      playBtn.classList.toggle('is-playing', playing)
      playBtn.classList.remove('is-morphing')
      void playBtn.offsetWidth
      playBtn.classList.add('is-morphing')
      clearTimeout(morphTimer)
      morphTimer = setTimeout(() => playBtn.classList.remove('is-morphing'), 440)
      setTimeout(() => { playIcon.textContent = playing ? 'pause' : 'play_arrow' }, 110)
    }

    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play')
    shuffleBtn.classList.toggle('is-active', library.settings.shuffle)
    shuffleBtn.setAttribute('aria-pressed', String(library.settings.shuffle))
    repeatBtn.classList.toggle('is-active', library.settings.repeat !== 'off')
    repeatBtn.setAttribute('aria-pressed', String(library.settings.repeat !== 'off'))
    repeatIcon.textContent = library.settings.repeat === 'one' ? 'repeat_one' : 'repeat'
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'
    }
  }

  function setWaveformState(state) {
    railBrand.classList.toggle('is-live', state === 'live')
    railBrand.classList.toggle('is-flat', state === 'flat')
    railBrand.dataset.waveformState = state
  }

  function drawRailWaveform(flat) {
    const ctx = railWaveform.getContext('2d')
    const width = railWaveform.width
    const height = railWaveform.height
    ctx.clearRect(0, 0, width, height)
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#62c685'
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    const bands = [[1, 3], [3, 6], [6, 12], [12, 24], [24, 64]]
    const gap = width / 6

    for (let index = 0; index < 5; index++) {
      let level = 0
      if (!flat && waveformData) {
        const [start, end] = bands[index]
        let total = 0
        let samples = 0
        for (let bin = start; bin < Math.min(end, waveformData.length); bin++) {
          total += waveformData[bin]
          samples++
        }
        const rawLevel = samples ? total / samples / 255 : 0
        const shapedLevel = Math.max(0, (rawLevel - WAVEFORM_LEVEL_FLOOR) / (1 - WAVEFORM_LEVEL_FLOOR))
        level = Math.min(1, Math.pow(shapedLevel, WAVEFORM_LEVEL_CURVE) * WAVEFORM_LEVEL_GAIN * WAVEFORM_BAND_GAINS[index])
      }
      const barHeight = flat ? 3 : Math.max(3, Math.min(height - 8, 3 + level * (height - 11)))
      const x = gap * (index + 1)
      ctx.beginPath()
      ctx.moveTo(x, height / 2 - barHeight / 2)
      ctx.lineTo(x, height / 2 + barHeight / 2)
      ctx.stroke()
    }
  }

  function connectWaveformAudio(audio) {
    if (!audio || !waveformContext || !waveformAnalyser) return false
    const existing = waveformSources.get(audio)
    if (existing) {
      const sameTrack = existing.trackId === String(audio.dataset.trackId || '')
      const liveTrack = existing.stream?.getAudioTracks().some(track => track.readyState === 'live')
      if (sameTrack && liveTrack) return true
      resetWaveformAudio(audio)
    }
    const captureStream = audio.captureStream || audio.mozCaptureStream
    if (typeof captureStream !== 'function') return false
    const stream = captureStream.call(audio)
    if (!stream?.getAudioTracks().length) return false
    const source = waveformContext.createMediaStreamSource(stream)
    source.connect(waveformAnalyser)
    waveformSources.set(audio, { source, stream, trackId: String(audio.dataset.trackId || '') })
    return true
  }

  function resetWaveformAudio(audio) {
    if (!audio) return
    stopWaveformCheck(audio)
    const existing = waveformSources.get(audio)
    if (!existing) return
    try { existing.source.disconnect() } catch {}
    for (const track of existing.stream?.getTracks() || []) {
      try { track.stop() } catch {}
    }
    waveformSources.delete(audio)
  }

  async function ensureWaveformAudio(audio = activeAudio) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    if (!waveformContext) {
      try {
        waveformContext = new AudioContextClass()
        waveformAnalyser = waveformContext.createAnalyser()
        waveformAnalyser.fftSize = 256
        waveformAnalyser.smoothingTimeConstant = 0.68
        waveformData = new Uint8Array(waveformAnalyser.frequencyBinCount)
        waveformSources = new WeakMap()
      } catch {
        waveformContext = null
        waveformAnalyser = null
        waveformData = null
        return
      }
    }
    try {
      if (waveformContext.state === 'suspended') await waveformContext.resume()
      return connectWaveformAudio(audio)
    } catch {}
    return false
  }

  function stopWaveformCheck(audio) {
    const check = waveformChecks.get(audio)
    if (!check) return
    clearInterval(check.timer)
    waveformChecks.delete(audio)
  }

  function verifyWaveformPlayback(audio = activeAudio) {
    if (!audio || audio.paused || audio.ended) {
      stopWaveformCheck(audio)
      return
    }

    if (audio === activeAudio && currentSong) {
      waveformLastSignal = Date.now()
      setWaveformState('live')
      drawRailWaveform(false)
    }

    if (waveformSources.has(audio) || waveformChecks.has(audio)) return

    const check = { attempts: 0, busy: false, timer: 0 }
    const run = async () => {
      if (check.busy) return
      if (audio.paused || audio.ended) {
        stopWaveformCheck(audio)
        return
      }
      check.busy = true
      check.attempts++
      const connected = await ensureWaveformAudio(audio)
      check.busy = false
      if (connected || waveformSources.has(audio) || check.attempts >= 50) stopWaveformCheck(audio)
    }
    check.timer = setInterval(run, 100)
    waveformChecks.set(audio, check)
    run()
  }

  function updateRailWaveform(now) {
    waveformFrame = requestAnimationFrame(updateRailWaveform)
    if (now - waveformLastDraw < 33) return
    waveformLastDraw = now

    if (!currentSong) {
      setWaveformState('idle')
      return
    }

    const audible = !activeAudio.paused && !activeAudio.ended && !activeAudio.muted && activeAudio.volume > 0
    if (audible && !waveformSources.has(activeAudio)) verifyWaveformPlayback(activeAudio)
    if (!audible || !waveformAnalyser || !waveformData) {
      if (!waveformLastSignal) waveformLastSignal = Date.now()
      if (Date.now() - waveformLastSignal >= WAVEFORM_IDLE_MS) setWaveformState('idle')
      else {
        setWaveformState('flat')
        drawRailWaveform(true)
      }
      return
    }

    waveformAnalyser.getByteFrequencyData(waveformData)
    let energy = 0
    for (const value of waveformData) {
      const normalized = value / 255
      energy += normalized * normalized
    }
    const rms = Math.sqrt(energy / waveformData.length)
    if (rms > 0.018) {
      waveformLastSignal = Date.now()
      setWaveformState('live')
      drawRailWaveform(false)
    } else if (Date.now() - waveformLastSignal >= WAVEFORM_IDLE_MS) {
      setWaveformState('idle')
    } else {
      setWaveformState('flat')
      drawRailWaveform(true)
    }
  }

  document.addEventListener('pointerdown', () => { ensureWaveformAudio() }, { capture: true })
  waveformFrame = requestAnimationFrame(updateRailWaveform)

  function updateMuteGlyph() {
    const volume = Math.max(0, Math.min(1, Number(library.settings.volume ?? 1)))
    const muted = Boolean(library.settings.muted) || volume === 0
    muteIcon.textContent = muted ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'
    muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute')
  }

  function updateVolumeSliderTrack() {
    const value = Math.max(0, Math.min(100, Number(volumeSlider.value)))
    const styles = getComputedStyle(document.documentElement)
    const track = styles.getPropertyValue('--outline-variant').trim() || '#d1d1d1'
    const brand = styles.getPropertyValue('--primary').trim() || '#2a844a'
    volumeSlider.style.background = `linear-gradient(to right, ${brand} 0%, ${brand} ${value}%, ${track} ${value}%, ${track} 100%)`
  }

  function applyAudioVolumeState() {
    const volume = Math.max(0, Math.min(1, Number(library.settings.volume ?? 1)))
    const muted = Boolean(library.settings.muted) || volume === 0
    activeAudio.volume = volume
    preloadAudio.volume = volume
    activeAudio.muted = muted
    preloadAudio.muted = muted
    volumeSlider.value = Math.round(volume * 100)
    updateMuteGlyph()
    updateVolumeSliderTrack()
  }

  function setVolumeFromSlider() {
    const volume = Math.max(0, Math.min(1, Number(volumeSlider.value) / 100))
    if (volume > 0) lastVolume = volume
    library.settings.volume = volume
    library.settings.muted = volume === 0
    applyAudioVolumeState()
    saveLibrary()
  }

  function toggleMute() {
    const muted = Boolean(library.settings.muted) || Number(library.settings.volume) === 0
    if (muted && Number(library.settings.volume) === 0) {
      library.settings.volume = lastVolume > 0 ? lastVolume : 1
    } else if (!muted) {
      lastVolume = Number(library.settings.volume) || lastVolume
    }
    library.settings.muted = !muted
    applyAudioVolumeState()
    saveLibrary()
  }

  function setProgressPct(pct) {
    const clamped = Math.min(100, Math.max(0, pct))
    progress.style.width = `${clamped}%`
    progressThumb.style.left = `${clamped}%`
    progressBar.setAttribute('aria-valuenow', String(Math.round(clamped)))
  }

  function syncProgressUI() {
    const dur = activeAudio.duration
    const cur = activeAudio.currentTime
    durationEl.textContent = fmtTime(dur)
    currentTimeEl.textContent = fmtTime(cur)
    if (Number.isFinite(dur) && dur > 0) setProgressPct((cur / dur) * 100)
    else setProgressPct(0)
  }

  let pendingSeekTime = null

  function previewSeekAtClientX(clientX) {
    const dur = activeAudio.duration
    if (!Number.isFinite(dur) || dur <= 0) return null
    const rect = progressBar.getBoundingClientRect()
    if (!rect.width) return null
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    pendingSeekTime = dur * pct
    currentTimeEl.textContent = fmtTime(pendingSeekTime)
    setProgressPct(pct * 100)
    return pendingSeekTime
  }

  function commitSeek(time) {
    if (!Number.isFinite(time) || !Number.isFinite(activeAudio.duration)) return
    const target = Math.min(Math.max(0, time), activeAudio.duration)
    if (typeof activeAudio.fastSeek === 'function') activeAudio.fastSeek(target)
    else activeAudio.currentTime = target
    currentTimeEl.textContent = fmtTime(target)
    setProgressPct((target / activeAudio.duration) * 100)
  }

  function onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (!activeAudio.src) return
    e.preventDefault()
    isScrubbing = true
    progressBar.classList.add('is-scrubbing')
    wasPlayingBeforeScrub = !activeAudio.paused && !activeAudio.ended
    try { progressBar.setPointerCapture(e.pointerId) } catch {}
    previewSeekAtClientX(e.clientX)
  }

  function onPointerMove(e) {
    if (!isScrubbing) return
    if (e.pointerType === 'mouse' && (e.buttons & 1) === 0) return
    e.preventDefault()
    previewSeekAtClientX(e.clientX)
  }

  function onPointerUp(e) {
    if (!isScrubbing) return
    e.preventDefault()
    isScrubbing = false
    progressBar.classList.remove('is-scrubbing')
    try { progressBar.releasePointerCapture(e.pointerId) } catch {}
    commitSeek(pendingSeekTime)
    pendingSeekTime = null
    resetLyricTracking()
    if (wasPlayingBeforeScrub && activeAudio.paused) activeAudio.play().catch(() => {})
  }

  function onPointerCancel(e) {
    if (!isScrubbing) return
    isScrubbing = false
    pendingSeekTime = null
    progressBar.classList.remove('is-scrubbing')
    try { progressBar.releasePointerCapture(e.pointerId) } catch {}
    syncProgressUI()
  }

  progressBar.addEventListener('pointerdown', onPointerDown)
  progressBar.addEventListener('pointermove', onPointerMove)
  progressBar.addEventListener('pointerup', onPointerUp)
  progressBar.addEventListener('pointercancel', onPointerCancel)

  progressBar.addEventListener('keydown', (e) => {
    if (!Number.isFinite(activeAudio.duration) || activeAudio.duration <= 0) return
    if (e.key === 'ArrowRight') {
      commitSeek(activeAudio.currentTime + 5)
      e.preventDefault()
    } else if (e.key === 'ArrowLeft') {
      commitSeek(activeAudio.currentTime - 5)
      e.preventDefault()
    }
    resetLyricTracking()
  })


  const lyricViews = [
    { scroll: nowLyricsScroll, lines: nowLyricsLines, empty: nowLyricsEmpty, nodes: [], wordNodes: [], holdUntil: 0 },
    { scroll: lyricsScroll, lines: lyricsLines, empty: lyricsEmpty, nodes: [], wordNodes: [], holdUntil: 0 }
  ]

  let lyricState = { synced: [], plain: '', offsetMs: 0, instrumental: false, matchedDuration: null, wordLevel: false }
  let lyricsToken = 0
  let lyricsRematched = false
  let lastLyricIndex = -2
  let lastSungWord = -1

  function updateLyricHint() {
    const audioDur = activeAudio.duration
    const matched = lyricState.matchedDuration
    if (!lyricState.synced.length || !Number.isFinite(audioDur) || !Number.isFinite(matched)) {
      lyricsHint.hidden = true
      return
    }
    const diff = Math.abs(audioDur - matched)
    if (diff < 6) {
      lyricsHint.hidden = true
      return
    }
    lyricsHint.textContent = `This recording runs ${Math.round(diff)}s different from the reference track, so the timing may drift slightly.`
    lyricsHint.hidden = false
  }

  function stampToMs(minutes, seconds, fractionDigits) {
    const m = Number(minutes) || 0
    const s = Number(seconds) || 0
    let fraction = 0
    if (fractionDigits) {
      const value = Number(fractionDigits) || 0
      fraction = fractionDigits.length === 1 ? value * 100 : fractionDigits.length === 2 ? value * 10 : value
    }
    return m * 60000 + s * 1000 + fraction
  }

  function extractWordTimings(content) {
    const wordRe = /<(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?>/g
    const tags = []
    let match
    while ((match = wordRe.exec(content)) !== null) {
      tags.push({ index: match.index, length: match[0].length, timeMs: stampToMs(match[1], match[2], match[3]) })
    }
    if (!tags.length) return null

    const words = []
    const lead = content.slice(0, tags[0].index)
    if (lead.trim()) words.push({ timeMs: null, text: lead })

    for (let i = 0; i < tags.length; i++) {
      const start = tags[i].index + tags[i].length
      const end = i + 1 < tags.length ? tags[i + 1].index : content.length
      const text = content.slice(start, end)
      if (!text) continue
      words.push({ timeMs: tags[i].timeMs, text })
    }
    return words.length ? words : null
  }

  function parseLRC(raw) {
    const rows = String(raw || '').split(/\r?\n/)
    const stampRe = /\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g
    const lines = []
    let offsetMs = 0
    let wordLevel = false
    let embeddedTranslations = false

    for (const row of rows) {
      const offsetTag = row.match(/^\s*\[offset:\s*([+-]?\d+)\s*\]/i)
      if (offsetTag) {
        offsetMs = Number(offsetTag[1]) || 0
        continue
      }

      stampRe.lastIndex = 0
      const stamps = []
      let match
      while ((match = stampRe.exec(row)) !== null) stamps.push(match)
      if (!stamps.length) continue

      const last = stamps[stamps.length - 1]
      const content = row.slice(last.index + last[0].length)
      const words = extractWordTimings(content)
      if (words) wordLevel = true
      let text = content.replace(/<\d{1,3}:\d{1,2}(?:[.:]\d{1,3})?>/g, '').trim()

      let embedded = ''
      const caret = text.split('^')
      if (caret.length === 2 && caret[0].trim() && caret[1].trim()) {
        text = caret[0].trim()
        embedded = caret[1].trim()
        embeddedTranslations = true
      }

      for (const stamp of stamps) {
        lines.push({
          timeMs: stampToMs(stamp[1], stamp[2], stamp[3]),
          text,
          translation: embedded || null,
          words: words || null
        })
      }
    }

    lines.sort((a, b) => a.timeMs - b.timeMs)
    for (let i = 0; i < lines.length; i++) {
      lines[i].endMs = i + 1 < lines.length ? lines[i + 1].timeMs : Number.POSITIVE_INFINITY
    }
    return { lines, offsetMs, wordLevel, embeddedTranslations }
  }

  function hasSyncedLyrics() {
    return lyricState.synced.length > 0 && library.settings.syncedLyrics
  }

  function resetLyricTracking() {
    lastLyricIndex = -2
    lastSungWord = -1
  }

  function clearLyricViews() {
    for (const view of lyricViews) {
      view.lines.innerHTML = ''
      view.nodes = []
      view.wordNodes = []
      view.scroll.classList.remove('word-level')
    }
    resetLyricTracking()
  }

  function setLyricsEmptyState(message) {
    for (const view of lyricViews) {
      const label = view.empty.querySelector('span:last-child')
      if (label) label.textContent = message
      view.empty.hidden = false
      view.scroll.hidden = true
    }
  }

  function showLyricViews() {
    for (const view of lyricViews) {
      view.empty.hidden = true
      view.scroll.hidden = false
    }
  }

  function syncNowPlayingLayout() {
    const hasLyrics = Boolean(lyricState.synced.length || lyricState.plain)
    const fullscreen = isFullscreen()
    const showLyrics = hasLyrics && (!fullscreen || library.settings.fullscreenLyrics !== false)
    const showUpNext = !fullscreen && library.settings.showUpNext !== false

    nowLyricsPanel.hidden = !showLyrics
    upNextPanel.hidden = !showUpNext
    nowPlayingGrid.classList.toggle('hide-lyrics', !showLyrics)
    nowPlayingGrid.classList.toggle('hide-up-next', !showUpNext)

    upNextToggleChip.classList.toggle('is-active', showUpNext)
    upNextToggleChip.setAttribute('aria-pressed', String(showUpNext))
    upNextToggleLabel.textContent = showUpNext ? 'Hide Up next' : 'Show Up next'

    fullscreenLyricsToggle.hidden = !(fullscreen && hasLyrics)
    fullscreenLyricsToggle.classList.toggle('is-active', showLyrics)
    fullscreenLyricsToggle.setAttribute('aria-pressed', String(showLyrics))
    fullscreenLyricsLabel.textContent = showLyrics ? 'Hide lyrics' : 'Show lyrics'
  }

  function renderLyrics() {
    clearLyricViews()
    const synced = hasSyncedLyrics()

    if (lyricState.instrumental && !lyricState.synced.length && !lyricState.plain) {
      setLyricsEmptyState('This track is instrumental')
      lyricsBadge.hidden = true
      syncNowPlayingLayout()
      return
    }

    if (synced) {
      showLyricViews()
      lyricsBadge.hidden = false
      lyricsBadge.textContent = lyricState.wordLevel ? 'Karaoke' : 'Line synced'

      for (const view of lyricViews) {
        view.scroll.classList.toggle('word-level', lyricState.wordLevel)
        const frag = document.createDocumentFragment()

        lyricState.synced.forEach((line, index) => {
          const node = document.createElement('button')
          node.type = 'button'
          node.className = 'lyric-line'
          if (!line.text) node.classList.add('is-instrumental')

          const span = document.createElement('span')
          span.className = 'lyric-text'

          if (!line.text) {
            span.textContent = '· · ·'
            view.wordNodes[index] = null
          } else if (lyricState.wordLevel && line.words) {
            const wordEls = []
            line.words.forEach((word) => {
              const wordEl = document.createElement('span')
              wordEl.className = 'lyric-word'
              wordEl.textContent = word.text
              span.appendChild(wordEl)
              wordEls.push({ el: wordEl, timeMs: word.timeMs })
            })
            view.wordNodes[index] = wordEls
          } else {
            span.textContent = line.text
            view.wordNodes[index] = null
          }

          node.appendChild(span)
          node.addEventListener('click', () => seekToLyric(index))
          frag.appendChild(node)
          view.nodes.push(node)
        })

        view.lines.appendChild(frag)
      }

      updateLyricPadding()
      recenterLyrics(true)
      syncNowPlayingLayout()
      return
    }

    if (lyricState.plain) {
      showLyricViews()
      lyricsBadge.hidden = true
      for (const view of lyricViews) {
        const block = document.createElement('div')
        block.className = 'lyric-plain'
        block.textContent = lyricState.plain
        view.lines.appendChild(block)
        view.lines.style.paddingBlock = '0px'
      }
      syncNowPlayingLayout()
      return
    }

    lyricsBadge.hidden = true
    setLyricsEmptyState(currentSong ? 'No lyrics found for this track' : 'Lyrics appear here while a track plays')
    syncNowPlayingLayout()
  }

  function updateLyricPadding() {
    if (!hasSyncedLyrics()) return
    for (const view of lyricViews) {
      const height = view.scroll.clientHeight
      if (!height) continue
      view.lines.style.paddingBlock = `${Math.round(height * 0.42)}px`
    }
  }

  function seekToLyric(index) {
    const line = lyricState.synced[index]
    if (!line || !activeAudio.src) return
    activeAudio.currentTime = Math.max(0, (line.timeMs - lyricState.offsetMs) / 1000)
    resetLyricTracking()
    if (activeAudio.paused) activeAudio.play().catch(() => {})
  }

  function findLyricIndex(timeMs) {
    const lines = lyricState.synced
    if (!lines.length) return -1
    let low = 0
    let high = lines.length - 1
    let found = -1
    while (low <= high) {
      const mid = (low + high) >> 1
      if (lines[mid].timeMs <= timeMs) {
        found = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
    return found
  }

  function centerLyricLine(view, node, immediate) {
    if (!node || !view.scroll.clientHeight) return
    if (!immediate && Date.now() < view.holdUntil) return
    if (view.scroll.offsetParent === null) return
    const target = node.offsetTop - view.scroll.clientHeight / 2 + node.offsetHeight / 2
    view.scroll.scrollTo({
      top: Math.max(0, target),
      behavior: reducedMotion.matches || immediate ? 'auto' : 'smooth'
    })
  }

  function applyActiveLyric(index, immediate) {
    for (const view of lyricViews) {
      view.nodes.forEach((node, i) => {
        node.classList.toggle('is-active', i === index)
        node.classList.toggle('is-past', i < index)
        if (i !== index) {
          const words = view.wordNodes[i]
          if (words) {
            const sung = i < index
            for (const word of words) word.el.classList.toggle('is-sung', sung)
          }
        }
      })
      if (index >= 0) centerLyricLine(view, view.nodes[index], immediate)
    }
  }

  function recenterLyrics(immediate) {
    if (!hasSyncedLyrics()) return
    if (lastLyricIndex >= 0) {
      for (const view of lyricViews) centerLyricLine(view, view.nodes[lastLyricIndex], immediate)
    }
  }

  function tickLyrics() {
    requestAnimationFrame(tickLyrics)
    if (!hasSyncedLyrics()) return

    const timeMs = activeAudio.currentTime * 1000 + lyricState.offsetMs
    const index = findLyricIndex(timeMs)

    if (index !== lastLyricIndex) {
      lastLyricIndex = index
      lastSungWord = -1
      applyActiveLyric(index, false)
    }

    if (index < 0 || !lyricState.wordLevel) return

    const line = lyricState.synced[index]
    if (!line?.words) return

    let sungCount = 0
    for (const word of line.words) {
      if (word.timeMs === null || word.timeMs <= timeMs) sungCount++
      else break
    }
    if (sungCount === lastSungWord) return
    lastSungWord = sungCount

    for (const view of lyricViews) {
      const words = view.wordNodes[index]
      if (!words) continue
      for (let i = 0; i < words.length; i++) {
        words[i].el.classList.toggle('is-sung', i < sungCount)
      }
    }
  }

  for (const view of lyricViews) {
    const hold = () => { view.holdUntil = Date.now() + 6000 }
    view.scroll.addEventListener('wheel', hold, { passive: true })
    view.scroll.addEventListener('touchstart', hold, { passive: true })
  }

  async function fetchLyrics(song, durationSec) {
    const params = new URLSearchParams()
    params.set('artist', song.artistName || '')
    params.set('title', song.trackName || '')
    if (durationSec) params.set('duration', String(Math.round(durationSec)))
    const res = await fetch(`/music/lyrics?${params.toString()}`)
    if (!res.ok) {
      const err = new Error('lyrics-unavailable')
      err.status = res.status
      throw err
    }
    return await res.json()
  }

  function applyLyricsData(data) {
    lyricState = {
      synced: [],
      plain: data?.plainLyrics || '',
      offsetMs: 0,
      instrumental: Boolean(data?.instrumental),
      matchedDuration: Number.isFinite(data?.matched?.duration) ? data.matched.duration : null,
      wordLevel: false
    }
    if (data?.syncedLyrics) {
      const parsed = parseLRC(data.syncedLyrics)
      lyricState.synced = parsed.lines
      lyricState.offsetMs = -parsed.offsetMs
      lyricState.wordLevel = parsed.wordLevel
      lyricState.embeddedTranslations = parsed.embeddedTranslations
    }
    renderLyrics()
    updateLyricHint()
    updateTranslateAvailability()
    maybeTranslateLyrics()
  }

  async function loadLyricsForSong(song) {
    const token = ++lyricsToken
    lyricsRematched = false

    lyricState = { synced: [], plain: '', offsetMs: 0, instrumental: false, matchedDuration: null, wordLevel: false }
    clearLyricViews()
    lyricsBadge.hidden = true
    lyricsHint.hidden = true
    lyricsTranslateToggle.hidden = true

    setTrackTitle(lyricsTitle, song?.trackName || 'No song selected', song)
    lyricsArtist.textContent = song?.artistName || ''

    if (!song || (!song.trackName && !song.artistName)) {
      setLyricsEmptyState('Lyrics appear here while a track plays')
      syncNowPlayingLayout()
      return
    }

    setLyricsEmptyState('Looking for lyrics')
    syncNowPlayingLayout()

    try {
      const data = await fetchLyrics(song, lyricDurationFor(song))
      if (token !== lyricsToken) return
      applyLyricsData(data)
    } catch (e) {
      if (token !== lyricsToken) return
      setLyricsEmptyState(e?.status === 404 ? 'No lyrics found for this track' : 'Lyrics are unavailable right now')
      syncNowPlayingLayout()
    }
  }

  async function improveLyricMatch() {
    if (lyricsRematched || !currentSong) return
    const audioDur = activeAudio.duration
    if (!Number.isFinite(audioDur) || audioDur <= 0) return

    const matched = lyricState.matchedDuration
    const haveSynced = lyricState.synced.length > 0
    const mismatch = Number.isFinite(matched) ? Math.abs(matched - audioDur) : Infinity

    if (haveSynced && mismatch < 3) {
      updateLyricHint()
      return
    }

    lyricsRematched = true
    const token = lyricsToken
    const song = currentSong

    try {
      const data = await fetchLyrics(song, audioDur)
      if (token !== lyricsToken || currentSong !== song) return
      const nextDur = Number.isFinite(data?.matched?.duration) ? data.matched.duration : null
      const nextMismatch = Number.isFinite(nextDur) ? Math.abs(nextDur - audioDur) : Infinity
      const nextHasSynced = Boolean(data?.syncedLyrics)

      if (!haveSynced && nextHasSynced) {
        applyLyricsData(data)
        return
      }
      if (nextHasSynced && nextMismatch < mismatch) {
        applyLyricsData(data)
        return
      }
      updateLyricHint()
    } catch {
      updateLyricHint()
    }
  }

  function lyricDurationFor(song) {
    if (Number.isFinite(activeAudio.duration) && activeAudio.duration > 0) return activeAudio.duration
    const ms = Number(song?.trackTimeMillis)
    if (Number.isFinite(ms) && ms > 0) return ms / 1000
    return null
  }


  function translationTarget() {
    const stored = String(library.settings.translateTarget || '').trim()
    if (stored) return stored
    const pageLang = String(document.documentElement.lang || '').trim()
    const lang = String(pageLang || navigator.language || 'en').split('-')[0]
    return lang || 'en'
  }

  function lyricLanguageBase(language) {
    const value = String(language || '').toLowerCase().split('-')[0]
    return value === 'cmn' || value === 'yue' ? 'zh' : value
  }

  function detectLyricLanguage() {
    const text = lyricState.synced.map(line => line.text || '').join(' ').slice(0, 12000)
    if (!text.trim()) return ''
    if (/[぀-ヿ]/u.test(text)) return 'ja'
    if (/[가-힯]/u.test(text)) return 'ko'
    if (/[一-鿿]/u.test(text)) return 'zh'
    if (/[Ѐ-ӿ]/u.test(text)) return 'ru'
    if (/[؀-ۿ]/u.test(text)) return 'ar'
    if (/[ऀ-ॿ]/u.test(text)) return 'hi'
    if (/[฀-๿]/u.test(text)) return 'th'

    const words = text.toLowerCase().match(/[\p{L}]+/gu) || []
    if (words.length < 4) return ''
    const counts = new Map()
    for (const word of words) counts.set(word, (counts.get(word) || 0) + 1)
    const stopwords = {
      en: ['the', 'and', 'you', 'that', 'with', 'this', 'for', 'your', 'love', 'me', 'my', 'to', 'of', 'in', 'is', 'it'],
      es: ['que', 'de', 'la', 'el', 'en', 'y', 'por', 'para', 'con', 'una', 'mi', 'tu', 'te', 'no', 'yo'],
      fr: ['que', 'de', 'la', 'le', 'les', 'et', 'dans', 'pour', 'avec', 'une', 'mon', 'toi', 'pas', 'je'],
      de: ['der', 'die', 'das', 'und', 'ich', 'du', 'nicht', 'mit', 'für', 'ein', 'eine', 'mir', 'mein'],
      pt: ['que', 'de', 'do', 'da', 'em', 'e', 'por', 'para', 'com', 'uma', 'meu', 'você', 'não', 'eu'],
      it: ['che', 'di', 'la', 'il', 'e', 'in', 'per', 'con', 'una', 'mio', 'tu', 'non', 'io'],
      nl: ['de', 'het', 'een', 'en', 'ik', 'je', 'niet', 'met', 'voor', 'mijn', 'van']
    }
    let best = { language: '', score: 0 }
    for (const [language, list] of Object.entries(stopwords)) {
      const score = list.reduce((total, word) => total + Math.min(3, counts.get(word) || 0), 0)
      if (score > best.score) best = { language, score }
    }
    return best.score >= 3 ? best.language : ''
  }

  function updateTranslateAvailability() {
    const source = lyricLanguageBase(detectLyricLanguage())
    const target = lyricLanguageBase(translationTarget())
    const needed = Boolean(lyricState.embeddedTranslations || (source && target && source !== target))
    lyricsTranslateToggle.hidden = !needed
    if (!needed) {
      clearTranslations()
      setTranslateLabel('Translate', false)
    }
    return needed
  }

  function applyTranslations(lines) {
    for (const view of lyricViews) {
      view.nodes.forEach((node, index) => {
        const existing = node.querySelector('.lyric-translation')
        if (existing) existing.remove()
        const text = lines?.[index]
        if (!text || !lyricState.synced[index]?.text) return
        const span = document.createElement('span')
        span.className = 'lyric-translation'
        span.textContent = text
        node.appendChild(span)
      })
    }
    updateLyricPadding()
    recenterLyrics(true)
  }

  function clearTranslations() {
    for (const view of lyricViews) {
      view.nodes.forEach(node => {
        const existing = node.querySelector('.lyric-translation')
        if (existing) existing.remove()
      })
    }
  }

  function setTranslateLabel(text, active) {
    lyricsTranslateLabel.textContent = text
    lyricsTranslateToggle.classList.toggle('is-active', Boolean(active))
    lyricsTranslateToggle.setAttribute('aria-pressed', String(Boolean(active)))
  }

  async function maybeTranslateLyrics() {
    if (!updateTranslateAvailability()) return
    if (!library.settings.translateLyrics) {
      clearTranslations()
      setTranslateLabel('Translate', false)
      return
    }
    if (!aiEnabled) {
      setTranslateLabel('Translate', false)
      showToast('AI is not configured')
      return
    }
    if (!lyricState.synced.length) {
      setTranslateLabel('Translate', true)
      return
    }

    if (lyricState.embeddedTranslations) {
      applyTranslations(lyricState.synced.map(l => l.translation || ''))
      setTranslateLabel('Included', true)
      return
    }

    const token = lyricsToken
    const target = translationTarget()
    setTranslateLabel('Translating', true)

    try {
      const res = await fetch('/music/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: lyricState.synced.map(l => l.text || ''),
          target,
          trackKey: `${currentSong?.artistName || ''}|${currentSong?.trackName || ''}`
        })
      })
      if (token !== lyricsToken) return
      if (!res.ok) throw new Error('translate')
      const data = await res.json()
      if (token !== lyricsToken) return

      if (data.sameLanguage) {
        clearTranslations()
        lyricsTranslateToggle.hidden = true
        setTranslateLabel('Translate', false)
        return
      }
      applyTranslations(data.lines)
      setTranslateLabel(`${String(data.sourceLanguage || '').toUpperCase()} to ${target.toUpperCase()}`, true)
    } catch {
      if (token !== lyricsToken) return
      setTranslateLabel('Translate', true)
      showToast('Could not translate these lyrics')
    }
  }

  lyricsTranslateToggle.addEventListener('click', () => {
    library.settings.translateLyrics = !library.settings.translateLyrics
    saveLibrary()
    maybeTranslateLyrics()
  })

  lyricsSyncToggle.addEventListener('click', () => {
    library.settings.syncedLyrics = !library.settings.syncedLyrics
    saveLibrary()
    lyricsSyncToggle.classList.toggle('is-active', library.settings.syncedLyrics)
    lyricsSyncToggle.setAttribute('aria-pressed', String(library.settings.syncedLyrics))
    renderLyrics()
  })

  lyricsSizeToggle.addEventListener('click', () => {
    library.settings.lyricsCompact = !library.settings.lyricsCompact
    saveLibrary()
    applyLyricSize()
    updateLyricPadding()
    recenterLyrics(true)
  })

  function applyLyricSize() {
    lyricsScroll.classList.toggle('size-compact', Boolean(library.settings.lyricsCompact))
    lyricsSizeToggle.classList.toggle('is-active', Boolean(library.settings.lyricsCompact))
  }

  window.addEventListener('resize', () => {
    updateLyricPadding()
    recenterLyrics(true)
  })


  function closeRowMenu() {
    if (!openMenu) return
    openMenu.remove()
    openMenu = null
  }

  function openRowMenu(anchor, items) {
    closeRowMenu()
    const menu = document.createElement('div')
    menu.className = 'row-menu'
    menu.setAttribute('role', 'menu')

    items.forEach(item => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.setAttribute('role', 'menuitem')
      const glyph = document.createElement('span')
      glyph.className = 'material-symbols-outlined'
      glyph.textContent = item.glyph
      const label = document.createElement('span')
      label.textContent = item.label
      btn.appendChild(glyph)
      btn.appendChild(label)
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        closeRowMenu()
        item.run()
      })
      menu.appendChild(btn)
    })

    document.body.appendChild(menu)
    const menuRect = menu.getBoundingClientRect()
    const point = Number.isFinite(anchor?.x) && Number.isFinite(anchor?.y)
    const rect = point ? { left: anchor.x, right: anchor.x, top: anchor.y, bottom: anchor.y } : anchor.getBoundingClientRect()
    const preferredLeft = point ? rect.left : rect.right - menuRect.width
    const left = Math.max(8, Math.min(window.innerWidth - menuRect.width - 8, preferredLeft))
    let top = point ? rect.top : rect.bottom + 6
    if (top + menuRect.height > window.innerHeight - 8) top = Math.max(8, rect.top - menuRect.height - 6)
    menu.style.left = `${left}px`
    menu.style.top = `${top}px`
    openMenu = menu
    menu.querySelector('button')?.focus()
  }

  document.addEventListener('click', (e) => {
    if (openMenu && !openMenu.contains(e.target)) closeRowMenu()
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeRowMenu()
  })
  window.addEventListener('resize', closeRowMenu)

  function songMenuItems(song, opts = {}) {
    const items = [
      { glyph: 'play_arrow', label: 'Play now', run: () => { if (opts.playHandler) opts.playHandler(); else setQueue([song], 0) } },
      { glyph: 'playlist_play', label: 'Play next', run: () => { playNext(song); showToast('Playing next') } },
      { glyph: 'playlist_add', label: 'Add to queue', run: () => { addToQueue(song); showToast('Added to queue') } },
      { glyph: 'library_add', label: 'Add to playlist', run: () => openPlaylistSheet(song) },
      { glyph: 'radio', label: 'Start radio', run: () => startRadio(buildSearchQueryFromSong(song)) }
    ]
    if (opts.removeHandler) items.push({ glyph: 'delete', label: opts.removeLabel || 'Remove', run: opts.removeHandler })
    if (opts.moveUp) items.push({ glyph: 'keyboard_arrow_up', label: 'Move up', run: opts.moveUp })
    if (opts.moveDown) items.push({ glyph: 'keyboard_arrow_down', label: 'Move down', run: opts.moveDown })
    return items
  }

  function buildListRow(song, opts = {}) {
    const row = document.createElement('div')
    row.className = 'list-item'
    if (opts.compact) row.classList.add('is-compact')
    row.tabIndex = 0

    if (Number.isFinite(opts.index)) {
      const idx = document.createElement('span')
      idx.className = 'list-index'
      idx.textContent = String(opts.index + 1)
      row.appendChild(idx)
    }

    const art = document.createElement('img')
    art.className = 'list-art'
    art.src = artFor(song, false)
    art.alt = ''
    art.loading = 'lazy'
    row.appendChild(art)

    const meta = document.createElement('div')
    meta.className = 'list-meta'
    const title = document.createElement('div')
    title.className = 'list-title'
    setTrackTitle(title, song.trackName || 'Unknown', song)
    const sub = document.createElement('div')
    sub.className = 'list-subtitle'
    sub.textContent = song.artistName || song.collectionName || ''
    meta.appendChild(title)
    meta.appendChild(sub)
    row.appendChild(meta)

    const actions = document.createElement('div')
    actions.className = 'list-actions'

    const addAction = (glyph, label, handler, extraClass) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = extraClass ? `icon-btn ${extraClass}` : 'icon-btn'
      btn.setAttribute('aria-label', label)
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined'
      icon.textContent = glyph
      btn.appendChild(icon)
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        handler()
      })
      actions.appendChild(btn)
      return btn
    }

    if (opts.showActions !== false) {
      addAction('add', 'Add to queue', () => {
        addToQueue(song)
        showToast('Added to queue')
      }, 'action-secondary')
      const favBtnEl = addAction(isFavorite(song) ? 'favorite' : 'favorite_border', 'Toggle favorite', () => {
        toggleFavoriteFor(song)
        const glyph = favBtnEl.querySelector('.material-symbols-outlined')
        if (glyph) glyph.textContent = isFavorite(song) ? 'favorite' : 'favorite_border'
        if (isFavorite(song)) playLikeBurst(favBtnEl)
      })

      const moreBtn = addAction('more_vert', 'More actions', () => {
        openRowMenu(moreBtn, songMenuItems(song, opts))
      })
    }

    if (opts.showActions !== false) row.appendChild(actions)

    const ms = Number(song.trackTimeMillis)
    if (Number.isFinite(ms) && ms > 0) {
      const dur = document.createElement('span')
      dur.className = 'list-duration'
      dur.textContent = fmtTime(ms / 1000)
      row.appendChild(dur)
    }

    row.addEventListener('click', () => opts.playHandler?.())
    row.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      openRowMenu({ x: e.clientX, y: e.clientY }, songMenuItems(song, opts))
    })
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        opts.playHandler?.()
      }
    })
    return row
  }

  function buildSongCard(song, playHandler) {
    const card = document.createElement('div')
    card.className = 'song-card'
    card.tabIndex = 0

    const artWrap = document.createElement('div')
    artWrap.className = 'song-card-art'
    const url = artFor(song, true)
    if (url) {
      const img = document.createElement('img')
      img.src = url
      img.alt = ''
      img.loading = 'lazy'
      artWrap.appendChild(img)
    } else {
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined'
      icon.textContent = 'music_note'
      artWrap.appendChild(icon)
    }

    const play = document.createElement('button')
    play.type = 'button'
    play.className = 'song-card-play'
    play.setAttribute('aria-label', `Play ${song.trackName || 'track'}`)
    const playGlyph = document.createElement('span')
    playGlyph.className = 'material-symbols-outlined'
    playGlyph.textContent = 'play_arrow'
    play.appendChild(playGlyph)
    play.addEventListener('click', (e) => {
      e.stopPropagation()
      playHandler()
    })
    artWrap.appendChild(play)

    const title = document.createElement('div')
    title.className = 'song-card-title'
    setTrackTitle(title, song.trackName || 'Unknown', song)

    const sub = document.createElement('div')
    sub.className = 'song-card-sub'
    sub.textContent = song.artistName || song.collectionName || ''

    card.appendChild(artWrap)
    card.appendChild(title)
    card.appendChild(sub)
    card.addEventListener('click', playHandler)
    card.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      openRowMenu({ x: e.clientX, y: e.clientY }, songMenuItems(song, { playHandler }))
    })
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        playHandler()
      }
    })
    return card
  }


  function renderQueue() {
    invalidateNextPlan()
    queueList.innerHTML = ''
    queue.forEach((song, idx) => {
      const row = buildListRow(song, {
        index: idx,
        playHandler: () => { queueIndex = idx; playSong(song) },
        removeHandler: () => removeFromQueue(idx),
        moveUp: () => moveQueueItem(idx, idx - 1),
        moveDown: () => moveQueueItem(idx, idx + 1)
      })
      if (idx === queueIndex) row.classList.add('is-current')
      queueList.appendChild(row)
    })
    renderUpNext()
    const upcoming = queue.length - Math.max(0, queueIndex + 1)
    if (upcoming > 0) {
      queueBadge.textContent = String(Math.min(99, upcoming))
      queueBadge.hidden = false
    } else {
      queueBadge.hidden = true
    }
  }

  function renderUpNext() {
    upNextList.innerHTML = ''
    let shown = 0
    queue.forEach((song, idx) => {
      if (idx <= queueIndex) return
      shown++
      upNextList.appendChild(buildListRow(song, {
        showActions: false,
        compact: true,
        playHandler: () => { queueIndex = idx; playSong(song) }
      }))
    })
    if (!shown) {
      const empty = document.createElement('div')
      empty.className = 'state-block small'
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined'
      icon.textContent = 'queue_music'
      const text = document.createElement('span')
      text.textContent = 'Nothing queued yet'
      empty.appendChild(icon)
      empty.appendChild(text)
      upNextList.appendChild(empty)
    }
  }

  function removeFromQueue(idx) {
    if (idx < 0 || idx >= queue.length) return
    queue.splice(idx, 1)
    if (idx < queueIndex) queueIndex--
    else if (queueIndex >= queue.length) queueIndex = queue.length - 1
    renderQueue()
    topUpQueue()
  }

  function moveQueueItem(from, to) {
    if (to < 0 || to >= queue.length) return
    const [item] = queue.splice(from, 1)
    queue.splice(to, 0, item)
    if (queueIndex === from) queueIndex = to
    else if (from < queueIndex && to >= queueIndex) queueIndex--
    else if (from > queueIndex && to <= queueIndex) queueIndex++
    renderQueue()
  }

  function addToQueue(song) {
    const key = coreTrackKey(song) || songIdentity(song)
    if (sessionTrackKeys.has(key)) {
      showToast('That song is already in this listening session')
      return
    }
    queue.push(song)
    registerSessionTracks([song])
    renderQueue()
  }

  function playNext(song) {
    const key = coreTrackKey(song) || songIdentity(song)
    if (sessionTrackKeys.has(key)) {
      showToast('That song is already in this listening session')
      return
    }
    queue.splice(queueIndex + 1, 0, song)
    registerSessionTracks([song])
    renderQueue()
  }

  function clearQueue() {
    queue = []
    queueIndex = -1
    queueContext = { source: 'manual', finiteEnd: -1, phase: 'algorithm', algorithmContext: [], algorithmPool: [], aiPool: [] }
    sessionTrackKeys = new Set()
    sessionSongs = []
    activeAudio.pause()
    preloadAudio.pause()
    resetWaveformAudio(activeAudio)
    resetWaveformAudio(preloadAudio)
    activeAudio.removeAttribute('src')
    preloadAudio.removeAttribute('src')
    currentSong = null
    setArtwork('')
    songTitle.textContent = 'No song selected'
    artistName.textContent = 'Search for a song to play'
    nowTitle.textContent = 'No song selected'
    nowArtist.textContent = 'Pick a track to start'
    setProgressPct(0)
    currentTimeEl.textContent = '0:00'
    durationEl.textContent = '0:00'
    loadLyricsForSong(null)
    renderQueue()
    syncPlayUI()
  }

  function songIdentity(song) {
    const artist = String(song?.artistName || '').toLowerCase().trim()
    const title = String(song?.trackName || '')
      .toLowerCase()
      .replace(/\s*[([][^)\]]*[)\]]\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return `${artist}|${title}`
  }

  const TITLE_NOISE =
    /\b(official|video|audio|lyrics?|lyric|visualizer|hd|hq|4k|remaster(ed)?|explicit|clean|mv|full|song|music|version|feat|ft|with|prod|colou?r\s*coded|sub\s*espanol|legendado|letra|live|acoustic|cover|karaoke|instrumental|remix|mix(ed)?|edit|extended|vip|flip|bootleg|rework|party\s*break|club|sped\s*up|slowed)\b/g

  function coreTrackKey(song) {
    let title = String(song?.trackName || '')
    if (!title) return ''

    const artist = String(song?.artistName || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}&,\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const primaryArtist = artist
      .split(/\s+(?:&|and|feat(?:uring)?|ft)\s+|,/i)[0]
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    title = title.replace(/[([{][^)\]}]*[)\]}]/g, ' ')
    title = title.replace(/[@#]\w+/g, ' ')
    title = title.replace(/\b(?:feat(?:uring)?|ft|with)\.?\s+.*$/i, ' ')
    title = title.split(/\s*\/\s*/)[0]

    const parts = title.split(/\s+[-\u2013\u2014|:]\s+/).filter(p => p.trim())
    if (parts.length > 1) {
      const withoutArtist = parts.filter(part => {
        const normalized = part.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()
        return normalized !== primaryArtist
      })
      title = (withoutArtist.length ? withoutArtist : parts).reduce((a, b) => (b.length > a.length ? b : a))
    }

    let core = title
      .toLowerCase()
      .replace(/[\u2018\u2019\u201c\u201d'"`]/g, '')
      .replace(TITLE_NOISE, ' ')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (primaryArtist && core.startsWith(`${primaryArtist} `)) {
      core = core.slice(primaryArtist.length).trim()
    }

    if (core.length < 2) {
      core = String(song?.trackName || '').toLowerCase().replace(/\s+/g, ' ').trim()
    }
    return primaryArtist ? `${primaryArtist}|${core}` : core
  }

  function dedupeQueueList(list, keepIndex) {
    const seen = new Set()
    const out = []
    let newIndex = 0
    list.forEach((song, idx) => {
      if (!song) return
      const key = coreTrackKey(song) || songIdentity(song)
      if (seen.has(key)) {
        if (idx === keepIndex) newIndex = out.length - 1
        return
      }
      seen.add(key)
      if (idx === keepIndex) newIndex = out.length
      out.push(song)
    })
    return { list: out, index: Math.max(0, newIndex) }
  }

  function registerSessionTracks(tracks) {
    for (const song of tracks || []) {
      const key = coreTrackKey(song) || songIdentity(song)
      if (!key || sessionTrackKeys.has(key)) continue
      sessionTrackKeys.add(key)
      sessionSongs.push(song)
    }
  }

  function setQueue(list, startIndex = 0, options = {}) {
    const deduped = dedupeQueueList(list, startIndex)
    queue = deduped.list
    if (!queue.length) {
      clearQueue()
      return
    }
    queueIndex = Math.max(0, Math.min(deduped.index, queue.length - 1))
    sessionTrackKeys = new Set()
    sessionSongs = []
    registerSessionTracks(queue)
    queueContext = {
      source: options.source || 'manual',
      finiteEnd: options.finite ? queue.length - 1 : -1,
      phase: 'algorithm',
      algorithmContext: [],
      algorithmPool: [],
      aiPool: []
    }
    renderQueue()
    playSong(queue[queueIndex])
  }


  function playLikeBurst(button) {
    if (!button || reducedMotion.matches) return
    button.classList.remove('is-bursting')
    void button.offsetWidth
    button.classList.add('is-bursting')

    const burst = document.createElement('span')
    burst.className = 'fav-burst'
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('span')
      particle.className = 'fav-particle'
      particle.style.setProperty('--angle', `${i * 45}deg`)
      particle.style.animationDelay = `${i % 2 === 0 ? 0 : 40}ms`
      burst.appendChild(particle)
    }
    button.appendChild(burst)

    setTimeout(() => {
      button.classList.remove('is-bursting')
      burst.remove()
    }, 700)
  }

  function toggleFavoriteFor(song) {
    if (!song) return
    const i = library.favorites.findIndex(s => s.trackId === song.trackId)
    if (i > -1) {
      library.favorites.splice(i, 1)
      tasteBump(song, 'unfavorite')
      showToast('Removed from favorites')
    } else {
      library.favorites.unshift(song)
      tasteBump(song, 'favorite')
      showToast('Added to favorites')
      if (song.trackId === currentSong?.trackId) playLikeBurst(favBtn)
    }
    saveLibrary()
    updateFavoriteUI()
    renderFavorites()
    renderQueue()
    renderQuickRadios()
  }

  function renderFavorites() {
    favoritesGrid.innerHTML = ''
    if (!library.favorites.length) {
      favoritesEmpty.hidden = false
      return
    }
    favoritesEmpty.hidden = true
    library.favorites.forEach((song, idx) => {
      favoritesGrid.appendChild(buildSongCard(song, () => setQueue(library.favorites, idx)))
    })
  }


  function createPlaylist(details) {
    const name = String(typeof details === 'string' ? details : details?.name || '').trim()
    if (!name) return null
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16).slice(2)
    library.playlists.push({
      id,
      name,
      description: String(details?.description || '').trim(),
      picture: String(details?.picture || ''),
      tracks: dedupeTracks(Array.isArray(details?.tracks) ? details.tracks : [])
    })
    saveLibrary()
    renderPlaylists()
    return id
  }

  function addTrackToPlaylist(playlistId, track) {
    const pl = library.playlists.find(p => p.id === playlistId)
    if (!pl || !track) return
    if (pl.tracks.some(t => t.trackId === track.trackId)) {
      showToast('Already in that playlist')
      return
    }
    pl.tracks.push(track)
    saveLibrary()
    renderPlaylists()
    if (selectedPlaylistId === playlistId) renderPlaylistDetail(playlistId)
    showToast(`Added to ${pl.name}`)
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
    const hasPlaylists = library.playlists.length > 0
    playlistsEmpty.hidden = hasPlaylists
    playlistsWorkspace.hidden = !hasPlaylists

    if (!hasPlaylists) {
      selectedPlaylistId = null
      playlistDetailTitle.textContent = 'Playlist'
      playlistDetailDescription.textContent = 'Select a playlist to see its songs.'
      playlistDetailTracks.innerHTML = ''
      renderPlaylistCover(playlistDetailCover, null, true)
      return
    }

    library.playlists.forEach(pl => {
      const row = document.createElement('div')
      row.className = 'list-item'
      row.tabIndex = 0
      if (pl.id === selectedPlaylistId) row.classList.add('is-current')

      const cover = document.createElement('div')
      cover.className = 'mix-cover'
      renderPlaylistCover(cover, pl)

      const meta = document.createElement('div')
      meta.className = 'list-meta'
      const title = document.createElement('div')
      title.className = 'list-title'
      title.textContent = pl.name
      const sub = document.createElement('div')
      sub.className = 'list-subtitle'
      sub.textContent = `${pl.tracks.length} ${pl.tracks.length === 1 ? 'track' : 'tracks'}`
      meta.appendChild(title)
      meta.appendChild(sub)

      const actions = document.createElement('div')
      actions.className = 'list-actions'

      const playBtnEl = document.createElement('button')
      playBtnEl.type = 'button'
      playBtnEl.className = 'icon-btn'
      playBtnEl.setAttribute('aria-label', `Play ${pl.name}`)
      const playGlyph = document.createElement('span')
      playGlyph.className = 'material-symbols-outlined'
      playGlyph.textContent = 'play_arrow'
      playBtnEl.appendChild(playGlyph)
      playBtnEl.addEventListener('click', (e) => {
        e.stopPropagation()
        if (pl.tracks.length) setQueue(pl.tracks, 0, { source: 'playlist', finite: true })
        else showToast('That playlist is empty')
      })

      const deleteBtn = document.createElement('button')
      deleteBtn.type = 'button'
      deleteBtn.className = 'icon-btn'
      deleteBtn.setAttribute('aria-label', `Delete ${pl.name}`)
      const deleteGlyph = document.createElement('span')
      deleteGlyph.className = 'material-symbols-outlined'
      deleteGlyph.textContent = 'delete'
      deleteBtn.appendChild(deleteGlyph)
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        library.playlists = library.playlists.filter(p => p.id !== pl.id)
        if (selectedPlaylistId === pl.id) {
          selectedPlaylistId = null
          playlistDetailTitle.textContent = 'Playlist'
          playlistDetailDescription.textContent = 'Select a playlist to see its songs.'
          playlistDetailTracks.innerHTML = ''
          renderPlaylistCover(playlistDetailCover, null, true)
        }
        saveLibrary()
        renderPlaylists()
        showToast('Playlist deleted')
      })

      actions.appendChild(playBtnEl)
      actions.appendChild(deleteBtn)

      row.appendChild(cover)
      row.appendChild(meta)
      row.appendChild(actions)
      row.addEventListener('click', () => renderPlaylistDetail(pl.id))
      playlistsList.appendChild(row)
    })
  }

  function renderPlaylistCover(container, playlist, detail = false) {
    container.innerHTML = ''
    container.style.background = playlist ? gradientForId(playlist.id) : ''
    if (playlist?.picture) {
      const image = document.createElement('img')
      image.src = playlist.picture
      image.alt = ''
      container.appendChild(image)
      return
    }
    if (detail) {
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined'
      icon.textContent = 'library_music'
      container.appendChild(icon)
      return
    }
    container.textContent = (playlist?.name || 'P').charAt(0).toUpperCase()
  }

  function renderPlaylistDetail(id) {
    selectedPlaylistId = id
    const pl = library.playlists.find(p => p.id === id)
    playlistDetailTracks.innerHTML = ''
    if (!pl) {
      playlistDetailTitle.textContent = 'Playlist'
      playlistDetailDescription.textContent = 'Select a playlist to see its songs.'
      renderPlaylistCover(playlistDetailCover, null, true)
      return
    }
    playlistDetailTitle.textContent = pl.name
    playlistDetailDescription.textContent = pl.description || 'No description'
    renderPlaylistCover(playlistDetailCover, pl, true)
    if (!pl.tracks.length) {
      const empty = document.createElement('div')
      empty.className = 'state-block small'
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined'
      icon.textContent = 'music_note'
      const text = document.createElement('span')
      text.textContent = 'No tracks yet'
      empty.appendChild(icon)
      empty.appendChild(text)
      playlistDetailTracks.appendChild(empty)
    }
    pl.tracks.forEach((song, idx) => {
      playlistDetailTracks.appendChild(buildListRow(song, {
        index: idx,
        playHandler: () => setQueue(pl.tracks, idx, { source: 'playlist', finite: true }),
        removeHandler: () => removeTrackFromPlaylist(pl.id, song.trackId),
        removeLabel: 'Remove from playlist'
      }))
    })
    renderPlaylists()
  }

  function openPlaylistSheet(song) {
    pendingPlaylistTrack = song || currentSong
    if (!pendingPlaylistTrack) {
      showToast('Play a track first')
      return
    }
    sheetPlaylists.innerHTML = ''

    const create = document.createElement('button')
    create.type = 'button'
    create.className = 'btn btn-secondary sheet-create-playlist'
    const createGlyph = document.createElement('span')
    createGlyph.className = 'material-symbols-outlined'
    createGlyph.textContent = 'add'
    const createText = document.createElement('span')
    createText.className = 'btn-text'
    createText.textContent = 'Create new playlist'
    create.appendChild(createGlyph)
    create.appendChild(createText)
    create.addEventListener('click', () => {
      const seedTrack = pendingPlaylistTrack
      closePlaylistSheet()
      openCreatePlaylistDialog(seedTrack)
    })
    sheetPlaylists.appendChild(create)

    library.playlists.forEach(pl => {
      const row = document.createElement('div')
      row.className = 'list-item'
      row.tabIndex = 0
      const cover = document.createElement('div')
      cover.className = 'mix-cover'
      renderPlaylistCover(cover, pl)
      const meta = document.createElement('div')
      meta.className = 'list-meta'
      const title = document.createElement('div')
      title.className = 'list-title'
      title.textContent = pl.name
      const sub = document.createElement('div')
      sub.className = 'list-subtitle'
      sub.textContent = `${pl.tracks.length} ${pl.tracks.length === 1 ? 'track' : 'tracks'}`
      meta.appendChild(title)
      meta.appendChild(sub)
      row.appendChild(cover)
      row.appendChild(meta)
      row.addEventListener('click', () => {
        addTrackToPlaylist(pl.id, pendingPlaylistTrack)
        closePlaylistSheet()
      })
      sheetPlaylists.appendChild(row)
    })

    playlistSheet.hidden = false
  }

  function closePlaylistSheet() {
    playlistSheet.hidden = true
    pendingPlaylistTrack = null
  }

  sheetClose.addEventListener('click', closePlaylistSheet)
  playlistSheet.addEventListener('click', (e) => {
    if (e.target === playlistSheet) closePlaylistSheet()
  })

  function playlistDraftKey(song) {
    return String(song?.trackId || songIdentity(song))
  }

  function updatePlaylistSelectionCount() {
    const count = playlistDraftSelection.size
    playlistSelectionCount.textContent = `${count} selected`
  }

  function renderPlaylistDraftOptions() {
    playlistCreateTracks.innerHTML = ''
    if (!playlistDraftTracks.length) {
      const empty = document.createElement('div')
      empty.className = 'state-block small'
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined'
      icon.textContent = 'music_note'
      const text = document.createElement('span')
      text.textContent = 'Play or favorite songs to add them here'
      empty.appendChild(icon)
      empty.appendChild(text)
      playlistCreateTracks.appendChild(empty)
      updatePlaylistSelectionCount()
      return
    }

    for (const song of playlistDraftTracks) {
      const key = playlistDraftKey(song)
      const option = document.createElement('label')
      option.className = 'playlist-track-option'

      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.checked = playlistDraftSelection.has(key)
      checkbox.setAttribute('aria-label', `Add ${song.trackName || 'song'}`)
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) playlistDraftSelection.add(key)
        else playlistDraftSelection.delete(key)
        option.classList.toggle('is-selected', checkbox.checked)
        updatePlaylistSelectionCount()
      })

      const art = document.createElement('img')
      art.src = artFor(song, false)
      art.alt = ''

      const meta = document.createElement('span')
      meta.className = 'playlist-option-meta'
      const title = document.createElement('span')
      title.className = 'playlist-option-title'
      setTrackTitle(title, song.trackName || 'Unknown', song)
      const artist = document.createElement('span')
      artist.className = 'playlist-option-artist'
      artist.textContent = song.artistName || ''
      meta.appendChild(title)
      meta.appendChild(artist)

      option.classList.toggle('is-selected', checkbox.checked)
      option.appendChild(checkbox)
      option.appendChild(art)
      option.appendChild(meta)
      playlistCreateTracks.appendChild(option)
    }
    updatePlaylistSelectionCount()
  }

  function setPlaylistDraftPicture(dataUrl) {
    playlistDraftPicture = dataUrl || ''
    playlistImagePreview.hidden = !playlistDraftPicture
    playlistImageGlyph.hidden = Boolean(playlistDraftPicture)
    playlistImagePreview.src = playlistDraftPicture
    playlistImageChoose.classList.toggle('has-picture', Boolean(playlistDraftPicture))
  }

  function openCreatePlaylistDialog(seedTrack = null) {
    playlistCreateName.value = ''
    playlistCreateName.removeAttribute('aria-invalid')
    playlistCreateDescription.value = ''
    playlistImageInput.value = ''
    setPlaylistDraftPicture('')
    playlistDraftTracks = dedupeTracks([
      seedTrack,
      currentSong,
      ...library.favorites,
      ...library.history,
      ...library.playlists.flatMap(playlist => playlist.tracks || [])
    ].filter(Boolean)).slice(0, 30)
    playlistDraftSelection = new Set(seedTrack ? [playlistDraftKey(seedTrack)] : [])
    renderPlaylistDraftOptions()
    playlistCreateSheet.hidden = false
    requestAnimationFrame(() => playlistCreateName.focus())
  }

  function closeCreatePlaylistDialog() {
    playlistCreateSheet.hidden = true
    playlistDraftTracks = []
    playlistDraftSelection = new Set()
    setPlaylistDraftPicture('')
  }

  function resizePlaylistPicture(file) {
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 10 * 1024 * 1024) {
      showToast('Choose an image smaller than 10 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const size = Math.min(512, Math.max(image.naturalWidth, image.naturalHeight))
        const scale = Math.min(1, size / Math.max(image.naturalWidth, image.naturalHeight))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
        const context = canvas.getContext('2d')
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        setPlaylistDraftPicture(canvas.toDataURL('image/jpeg', 0.84))
      }
      image.onerror = () => showToast('Could not read that picture')
      image.src = String(reader.result || '')
    }
    reader.onerror = () => showToast('Could not read that picture')
    reader.readAsDataURL(file)
  }

  createPlaylistBtn.addEventListener('click', () => openCreatePlaylistDialog())
  createFirstPlaylistBtn.addEventListener('click', () => openCreatePlaylistDialog())
  playlistCreateClose.addEventListener('click', closeCreatePlaylistDialog)
  playlistCreateCancel.addEventListener('click', closeCreatePlaylistDialog)
  playlistCreateSheet.addEventListener('click', event => {
    if (event.target === playlistCreateSheet) closeCreatePlaylistDialog()
  })
  playlistImageChoose.addEventListener('click', () => playlistImageInput.click())
  playlistImageInput.addEventListener('change', () => resizePlaylistPicture(playlistImageInput.files?.[0]))
  playlistCreateName.addEventListener('input', () => playlistCreateName.removeAttribute('aria-invalid'))
  playlistCreateSave.addEventListener('click', () => {
    const name = playlistCreateName.value.trim()
    if (!name) {
      playlistCreateName.setAttribute('aria-invalid', 'true')
      playlistCreateName.focus()
      return
    }
    const tracks = playlistDraftTracks.filter(song => playlistDraftSelection.has(playlistDraftKey(song)))
    const id = createPlaylist({
      name,
      description: playlistCreateDescription.value,
      picture: playlistDraftPicture,
      tracks
    })
    closeCreatePlaylistDialog()
    if (id) {
      renderPlaylistDetail(id)
      showTab('playlists')
      showToast('Playlist created')
    }
  })


  function renderHome() {
    renderHero()
    renderContinue()
    renderMixes(readMixCache())
    renderQuickRadios()
  }

  function renderHero() {
    const featured = currentSong || library.history[0]
    heroArt.innerHTML = ''

    if (!featured) {
      heroEyebrow.textContent = 'Welcome back'
      setTrackTitle(heroTitle, 'Find something to play', null)
      heroSub.textContent = 'Search for a track, start a radio, or pick up where you left off.'
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined'
      icon.textContent = 'graphic_eq'
      heroArt.appendChild(icon)
      return
    }

    heroEyebrow.textContent = currentSong ? 'Now playing' : 'Pick up where you left off'
    setTrackTitle(heroTitle, featured.trackName || 'Unknown', featured)
    heroSub.textContent = featured.artistName || featured.collectionName || ''

    const url = artFor(featured, true)
    if (url) {
      const img = document.createElement('img')
      img.src = url
      img.alt = ''
      heroArt.appendChild(img)
    } else {
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined'
      icon.textContent = 'graphic_eq'
      heroArt.appendChild(icon)
    }
  }

  function renderContinue() {
    homeContinueGrid.innerHTML = ''
    const items = library.history.slice(0, 12)
    if (!items.length) {
      const empty = document.createElement('div')
      empty.className = 'state-block'
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined'
      icon.textContent = 'history'
      const text = document.createElement('span')
      text.textContent = 'Play something and it shows up here'
      empty.appendChild(icon)
      empty.appendChild(text)
      homeContinueGrid.appendChild(empty)
      continueNote.textContent = ''
      return
    }
    continueNote.textContent = `${library.history.length} recent ${library.history.length === 1 ? 'track' : 'tracks'}`
    items.forEach((song, idx) => {
      homeContinueGrid.appendChild(buildSongCard(song, () => setQueue(items, idx)))
    })
  }

  function renderMixes(aiMixes) {
    homeMixGrid.innerHTML = ''
    const deleted = readDeletedMixes()

    if (Array.isArray(aiMixes) && aiMixes.length) {
      const visible = aiMixes.filter(mix => !deleted.has(mix.id))
      if (visible.length) {
        visible.forEach(mix => homeMixGrid.appendChild(buildMixCard(mix, true)))
        return
      }
    }

    const seeds = [...library.history.slice(0, 40), ...library.favorites.slice(0, 30)]
    const artists = eligibleMixArtists()
    if (!artists.length) {
      const empty = document.createElement('div')
      empty.className = 'state-block'
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined'
      icon.textContent = 'auto_awesome'
      const text = document.createElement('span')
      text.textContent = 'Listen to an artist at least 3 times to unlock a mix'
      empty.appendChild(icon)
      empty.appendChild(text)
      homeMixGrid.appendChild(empty)
      return
    }

    const mixes = artists.map(({ name: artist }) => ({
      id: `artist-${normalizeLocalId(artist)}`,
      title: `${artist} Mix`,
      artist,
      mixType: 'Artist essentials',
      tracks: dedupeTracks(seeds.filter(s => s.artistName === artist)).slice(0, 20)
    })).filter(m => m.tracks.length && !deleted.has(m.id))

    if (mixes.length) {
      mixes.forEach(mix => homeMixGrid.appendChild(buildMixCard(mix, false)))
    } else {
      const empty = document.createElement('div')
      empty.className = 'state-block'
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined'
      icon.textContent = 'playlist_remove'
      const text = document.createElement('span')
      text.textContent = 'No mixes here. Regenerate to bring them back'
      empty.appendChild(icon)
      empty.appendChild(text)
      homeMixGrid.appendChild(empty)
    }
  }

  function normalizeLocalId(value) {
    return String(value || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')
  }

  function eligibleMixArtists() {
    const taste = ensureTaste()
    return Object.entries(taste.artists)
      .map(([name, data]) => ({ name, ...data }))
      .filter(artist => artist.name && (artist.plays || 0) >= 3)
      .sort((a, b) => (b.score || 0) - (a.score || 0) || (b.plays || 0) - (a.plays || 0))
      .slice(0, 4)
  }

  function readDeletedMixes() {
    try {
      return new Set(JSON.parse(localStorage.getItem('music-deleted-mixes-v1') || '[]'))
    } catch {
      return new Set()
    }
  }

  function deleteMix(mix) {
    const deleted = readDeletedMixes()
    deleted.add(mix.id)
    try {
      localStorage.setItem('music-deleted-mixes-v1', JSON.stringify([...deleted]))
      const cached = readMixCache() || []
      writeMixCache(cached.filter(item => item.id !== mix.id))
    } catch {}
    renderMixes(readMixCache())
    showToast(`${mix.title} deleted`)
  }

  function buildMixCard(mix, isAi) {
    const card = document.createElement('div')
    card.className = 'mix-card'
    card.style.background = gradientForId(mix.id || mix.title)
    card.tabIndex = 0

    const title = document.createElement('div')
    title.className = 'mix-title'
    title.textContent = mix.title

    const sub = document.createElement('div')
    sub.className = 'mix-sub'
    sub.textContent = mix.mixType || 'Artist mix'

    const remove = document.createElement('button')
    remove.type = 'button'
    remove.className = 'mix-delete'
    remove.setAttribute('aria-label', `Delete ${mix.title}`)
    const removeGlyph = document.createElement('span')
    removeGlyph.className = 'material-symbols-outlined'
    removeGlyph.textContent = 'delete'
    remove.appendChild(removeGlyph)
    remove.addEventListener('click', event => {
      event.stopPropagation()
      deleteMix(mix)
    })

    const play = document.createElement('button')
    play.type = 'button'
    play.className = 'mix-play'
    play.setAttribute('aria-label', `Play ${mix.title}`)
    const glyph = document.createElement('span')
    glyph.className = 'material-symbols-outlined'
    glyph.textContent = 'play_arrow'
    play.appendChild(glyph)

    const start = () => {
      const tracks = dedupeTracks(Array.isArray(mix.tracks) ? mix.tracks : [])
      if (!tracks.length) {
        showToast('This mix does not have any playable songs yet')
        return
      }
      setQueue(tracks, 0, { source: 'mix', finite: true })
      showTab('player')
    }
    play.addEventListener('click', (e) => { e.stopPropagation(); start() })
    card.addEventListener('click', start)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start() }
    })

    card.appendChild(title)
    card.appendChild(sub)
    card.appendChild(remove)
    card.appendChild(play)
    return card
  }

  function dedupeTracks(list) {
    const seen = new Set()
    const out = []
    for (const item of list) {
      const key = coreTrackKey(item) || songIdentity(item)
      if (seen.has(key)) continue
      seen.add(key)
      out.push(item)
    }
    return out
  }

  function renderQuickRadios() {
    homeRadioGrid.innerHTML = ''
    const seeds = []

    for (const artist of topTasteArtists(3)) {
      seeds.push({ label: `${artist.name} radio`, q: `${artist.name} songs` })
    }
    for (const genre of topTasteGenres(2)) {
      seeds.push({ label: `${genre.name} radio`, q: `${genre.name} music` })
    }

    const defaults = [
      { label: 'Chill', q: 'chill lofi beats' },
      { label: 'Focus', q: 'focus ambient study music' },
      { label: 'Energy', q: 'upbeat pop hits' },
      { label: 'Classics', q: 'classic rock hits' },
      { label: 'Jazz', q: 'smooth jazz playlist' }
    ]
    for (const item of defaults) {
      if (seeds.length >= 6) break
      seeds.push(item)
    }
    seeds.forEach(seed => {
      const chip = document.createElement('button')
      chip.type = 'button'
      chip.className = 'chip'
      const glyph = document.createElement('span')
      glyph.className = 'material-symbols-outlined'
      glyph.textContent = 'radio'
      const text = document.createElement('span')
      text.textContent = seed.label
      chip.appendChild(glyph)
      chip.appendChild(text)
      chip.addEventListener('click', () => startRadio(seed.q))
      homeRadioGrid.appendChild(chip)
    })
  }


  function setSearchMessage(message) {
    searchEmpty.hidden = false
    const label = searchEmpty.querySelector('span:last-child')
    if (label) label.textContent = message
  }

  function renderSearch() {
    searchResults.innerHTML = ''
    artistResults.innerHTML = ''
    playlistResults.innerHTML = ''

    searchResults.hidden = activeFacet !== 'songs'
    artistResults.hidden = activeFacet !== 'artists'
    playlistResults.hidden = activeFacet !== 'playlists'
    playlistScope.hidden = activeFacet !== 'playlists'
    searchEmpty.hidden = true

    if (activeFacet === 'songs') {
      const items = searchFacets.songs
      if (!items.length) {
        setSearchMessage(lastQuery ? 'No songs found, try enabling community uploads' : 'Search for a song to get started')
        return
      }
      items.forEach(song => {
        searchResults.appendChild(buildListRow(song, { playHandler: () => setQueue([song], 0) }))
      })
      return
    }

    if (activeFacet === 'artists') {
      const items = searchFacets.artists
      if (!items.length) {
        setSearchMessage(lastQuery ? 'No artists found' : 'Search to find artists')
        return
      }
      items.forEach(artist => artistResults.appendChild(buildArtistCard(artist)))
      return
    }

    if (playlistScopeValue === 'personal') {
      if (!library.playlists.length) {
        setSearchMessage('You have no playlists yet')
        return
      }
      library.playlists.forEach(pl => {
        playlistResults.appendChild(buildLocalPlaylistRow(pl))
      })
      return
    }

    const items = searchFacets.playlists
    if (!items.length) {
      setSearchMessage(lastQuery ? 'No community playlists for this search' : 'Search to find community playlists')
      return
    }
    items.forEach(pl => playlistResults.appendChild(buildCommunityPlaylistRow(pl)))
  }

  function buildArtistCard(artist) {
    const card = document.createElement('div')
    card.className = 'artist-card'
    card.tabIndex = 0

    const avatar = document.createElement('div')
    avatar.className = 'artist-avatar'
    avatar.textContent = (artist.artistName || '?').charAt(0).toUpperCase()

    const name = document.createElement('div')
    name.className = 'artist-name'
    name.textContent = artist.artistName

    const genre = document.createElement('div')
    genre.className = 'artist-genre'
    genre.textContent = artist.primaryGenreName || 'Artist'

    const open = () => {
      searchInput.value = artist.artistName
      runSearch()
    }
    card.addEventListener('click', open)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() }
    })

    card.appendChild(avatar)
    card.appendChild(name)
    card.appendChild(genre)
    return card
  }

  function buildLocalPlaylistRow(pl) {
    const row = document.createElement('div')
    row.className = 'list-item'
    row.tabIndex = 0

    const cover = document.createElement('div')
    cover.className = 'mix-cover'
    cover.style.background = gradientForId(pl.id)
    cover.textContent = (pl.name || 'P').charAt(0).toUpperCase()

    const meta = document.createElement('div')
    meta.className = 'list-meta'
    const title = document.createElement('div')
    title.className = 'list-title'
    title.textContent = pl.name
    const sub = document.createElement('div')
    sub.className = 'list-subtitle'
    sub.textContent = `Personal, ${pl.tracks.length} ${pl.tracks.length === 1 ? 'track' : 'tracks'}`
    meta.appendChild(title)
    meta.appendChild(sub)

    row.appendChild(cover)
    row.appendChild(meta)
    row.addEventListener('click', () => {
      if (!pl.tracks.length) {
        showToast('That playlist is empty')
        return
      }
      setQueue(pl.tracks, 0, { source: 'playlist', finite: true })
    })
    return row
  }

  function buildCommunityPlaylistRow(pl) {
    const row = document.createElement('div')
    row.className = 'list-item'
    row.tabIndex = 0

    if (pl.thumbnail) {
      const art = document.createElement('img')
      art.className = 'list-art'
      art.src = pl.thumbnail
      art.alt = ''
      art.loading = 'lazy'
      row.appendChild(art)
    } else {
      const cover = document.createElement('div')
      cover.className = 'mix-cover'
      cover.style.background = gradientForId(pl.listId)
      cover.textContent = (pl.title || 'P').charAt(0).toUpperCase()
      row.appendChild(cover)
    }

    const meta = document.createElement('div')
    meta.className = 'list-meta'
    const title = document.createElement('div')
    title.className = 'list-title'
    title.textContent = pl.title
    const sub = document.createElement('div')
    sub.className = 'list-subtitle'
    sub.textContent = pl.videoCount ? `${pl.author}, ${pl.videoCount} videos` : pl.author
    meta.appendChild(title)
    meta.appendChild(sub)

    row.appendChild(meta)
    row.addEventListener('click', () => loadCommunityPlaylist(pl))
    return row
  }

  function loadCommunityPlaylist(pl) {
    showToast(`Loading ${pl.title}`)
    fetch(`/music/playlist?listId=${encodeURIComponent(pl.listId)}`)
      .then(r => {
        if (!r.ok) throw new Error('playlist')
        return r.json()
      })
      .then(d => {
        const items = Array.isArray(d.results) ? d.results : []
        if (!items.length) throw new Error('empty')
        setQueue(items, 0)
        showTab('player')
      })
      .catch(() => showToast('Could not open that playlist'))
  }

  function hideSearchSuggestions() {
    searchSuggestions.hidden = true
    searchSuggestions.innerHTML = ''
    searchInput.setAttribute('aria-expanded', 'false')
    searchInput.removeAttribute('aria-activedescendant')
    suggestionItems = []
    suggestionIndex = -1
  }

  function localSearchSuggestions(query) {
    const needle = query.toLowerCase()
    const tracks = dedupeTracks([...library.history, ...library.favorites, ...lastResults])
    const items = []
    for (const song of tracks) {
      const title = String(song.trackName || '')
      const artist = String(song.artistName || '')
      if (!`${title} ${artist}`.toLowerCase().includes(needle)) continue
      items.push({ kind: 'song', label: title, secondary: artist, query: `${title} ${artist}`.trim() })
      if (items.length >= 5) break
    }
    for (const playlist of library.playlists) {
      if (!String(playlist.name || '').toLowerCase().includes(needle)) continue
      items.push({ kind: 'playlist', label: playlist.name, secondary: 'Your playlist', query: playlist.name })
    }
    return items
  }

  function mergeSuggestions(...groups) {
    const seen = new Set()
    const merged = []
    for (const item of groups.flat()) {
      if (!item?.label) continue
      const key = `${item.kind || ''}|${String(item.label).toLowerCase()}|${String(item.secondary || '').toLowerCase()}`
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(item)
      if (merged.length >= 8) break
    }
    return merged
  }

  function chooseSearchSuggestion(item) {
    searchInput.value = item.query || item.label
    searchClear.hidden = false
    hideSearchSuggestions()
    runSearch()
  }

  function renderSearchSuggestions(items) {
    suggestionItems = items.slice(0, 8)
    suggestionIndex = -1
    searchSuggestions.innerHTML = ''
    if (!suggestionItems.length) {
      hideSearchSuggestions()
      return
    }
    suggestionItems.forEach((item, index) => {
      const option = document.createElement('button')
      option.type = 'button'
      option.className = 'search-suggestion'
      option.id = `searchSuggestion${index}`
      option.setAttribute('role', 'option')
      option.setAttribute('aria-selected', 'false')
      const glyph = document.createElement('span')
      glyph.className = 'material-symbols-outlined'
      glyph.textContent = item.kind === 'artist' ? 'person' : item.kind === 'playlist' ? 'library_music' : 'music_note'
      const copy = document.createElement('span')
      copy.className = 'search-suggestion-copy'
      const label = document.createElement('span')
      label.className = 'search-suggestion-label'
      label.textContent = item.label
      const secondary = document.createElement('span')
      secondary.className = 'search-suggestion-secondary'
      secondary.textContent = item.secondary || (item.kind === 'artist' ? 'Artist' : 'Song')
      copy.appendChild(label)
      copy.appendChild(secondary)
      option.appendChild(glyph)
      option.appendChild(copy)
      option.addEventListener('pointerdown', e => e.preventDefault())
      option.addEventListener('click', () => chooseSearchSuggestion(item))
      searchSuggestions.appendChild(option)
    })
    searchSuggestions.hidden = false
    searchInput.setAttribute('aria-expanded', 'true')
  }

  function setSuggestionIndex(index) {
    if (!suggestionItems.length) return
    suggestionIndex = (index + suggestionItems.length) % suggestionItems.length
    const options = [...searchSuggestions.querySelectorAll('.search-suggestion')]
    options.forEach((option, optionIndex) => {
      const active = optionIndex === suggestionIndex
      option.classList.toggle('is-active', active)
      option.setAttribute('aria-selected', String(active))
    })
    const active = options[suggestionIndex]
    if (active) {
      searchInput.setAttribute('aria-activedescendant', active.id)
      active.scrollIntoView({ block: 'nearest' })
    }
  }

  function requestSearchSuggestions() {
    const query = searchInput.value.trim()
    clearTimeout(suggestionTimer)
    suggestionRequest?.abort()
    if (!query) {
      hideSearchSuggestions()
      return
    }
    const local = localSearchSuggestions(query)
    renderSearchSuggestions(local)
    suggestionTimer = setTimeout(async () => {
      suggestionRequest = new AbortController()
      try {
        const response = await fetch(`/music/suggest?q=${encodeURIComponent(query)}`, { signal: suggestionRequest.signal })
        if (!response.ok || searchInput.value.trim() !== query) return
        const data = await response.json()
        renderSearchSuggestions(mergeSuggestions(local, Array.isArray(data.suggestions) ? data.suggestions : []))
      } catch (error) {
        if (error?.name !== 'AbortError' && local.length) renderSearchSuggestions(local)
      }
    }, 220)
  }

  function runSearch() {
    const q = searchInput.value.trim()
    if (!q) return
    hideSearchSuggestions()
    lastQuery = q
    showTab('search')
    searchLoading.hidden = false
    searchEmpty.hidden = true
    searchResults.innerHTML = ''
    artistResults.innerHTML = ''
    playlistResults.innerHTML = ''

    const params = new URLSearchParams({ q })
    if (library.settings.includeCommunity) params.set('community', '1')

    fetch(`/music/meta?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        searchFacets = {
          songs: Array.isArray(d.songs) ? d.songs : Array.isArray(d.results) ? d.results : [],
          artists: Array.isArray(d.artists) ? d.artists : [],
          playlists: Array.isArray(d.playlists) ? d.playlists : []
        }
        lastResults = searchFacets.songs
        renderSearch()
      })
      .catch(() => {
        searchFacets = { songs: [], artists: [], playlists: [] }
        lastResults = []
        renderSearch()
        setSearchMessage('Search failed, try again')
      })
      .finally(() => {
        searchLoading.hidden = true
      })
  }

  const searchSongs = runSearch

  searchFilters.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip[data-filter]')
    if (!btn) return
    activeFacet = btn.dataset.filter
    searchFilters.querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c === btn))
    renderSearch()
  })

  playlistScope.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip[data-scope]')
    if (!btn) return
    playlistScopeValue = btn.dataset.scope
    playlistScope.querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c === btn))
    renderSearch()
  })

  communityToggle.addEventListener('click', () => {
    library.settings.includeCommunity = !library.settings.includeCommunity
    saveLibrary()
    syncCommunityToggle()
    if (lastQuery) runSearch()
  })

  function syncCommunityToggle() {
    const on = Boolean(library.settings.includeCommunity)
    communityToggle.classList.toggle('is-active', on)
    communityToggle.setAttribute('aria-pressed', String(on))
  }

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSuggestionIndex(suggestionIndex + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSuggestionIndex(suggestionIndex - 1)
    } else if (e.key === 'Escape') {
      hideSearchSuggestions()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestionIndex >= 0) chooseSearchSuggestion(suggestionItems[suggestionIndex])
      else searchSongs()
    }
  })

  searchInput.addEventListener('input', () => {
    searchClear.hidden = !searchInput.value
    requestSearchSuggestions()
  })

  searchInput.addEventListener('focus', requestSearchSuggestions)
  searchInput.addEventListener('blur', () => setTimeout(hideSearchSuggestions, 120))

  searchClear.addEventListener('click', () => {
    searchInput.value = ''
    searchClear.hidden = true
    hideSearchSuggestions()
    searchInput.focus()
  })

  searchBtn.addEventListener('click', searchSongs)


  const DERIVATIVE_TITLE =
    /\b(acapella|a\s*cappella|instrumental|karaoke|backing\s*track|cover|remix|mashup|nightcore|sped\s*up|slowed|8d\s*audio|tribute|fingerstyle|finger\s*style|piano\s+version|guitar\s+version|string\s+quartet|music\s+box|lullaby|8\s*bit|chiptune|midi|meditation|in\s+the\s+style\s+of|made\s+famous\s+by|originally\s+performed)\b/i

  const DERIVATIVE_ARTIST_NAME =
    /\b(string\s+quartet|tribute|piano\s+tribute|lullaby|rockabye|kidz\s+bop|karaoke|8\s*bit|chiptune|music\s+box|meditation|relaxing|study\s+music|cover\s+band|made\s+famous|vitamin\s+string)\b/i

  const TASTE_DECAY_PER_DAY = 0.985
  const TASTE_WEIGHTS = {
    start: { artist: 0.5, genre: 0.25 },
    complete: { artist: 2.5, genre: 1.2 },
    skipEarly: { artist: -2, genre: -0.8 },
    skipMid: { artist: -0.4, genre: -0.2 },
    favorite: { artist: 5, genre: 2.5 },
    unfavorite: { artist: -5, genre: -2.5 }
  }

  let playWatch = null

  function ensureTaste() {
    if (!library.taste || typeof library.taste !== 'object') {
      library.taste = { artists: {}, genres: {}, tracks: {}, updatedAt: Date.now() }
    }
    library.taste.artists = library.taste.artists || {}
    library.taste.genres = library.taste.genres || {}
    library.taste.tracks = library.taste.tracks || {}
    return library.taste
  }

  function decayTaste() {
    const taste = ensureTaste()
    const days = (Date.now() - (taste.updatedAt || Date.now())) / 86400000
    if (days < 0.5) return
    const factor = Math.pow(TASTE_DECAY_PER_DAY, days)
    for (const bucket of [taste.artists, taste.genres]) {
      for (const key of Object.keys(bucket)) {
        bucket[key].score = (bucket[key].score || 0) * factor
        if (Math.abs(bucket[key].score) < 0.05 && !bucket[key].favorites) delete bucket[key]
      }
    }
    taste.updatedAt = Date.now()
  }

  function tasteBump(song, kind) {
    if (!song) return
    const weights = TASTE_WEIGHTS[kind]
    if (!weights) return
    const taste = ensureTaste()

    const artistName = song.artistName || ''
    if (artistName) {
      const entry = taste.artists[artistName] || { score: 0, plays: 0, skips: 0, completions: 0, favorites: 0 }
      entry.score = (entry.score || 0) + weights.artist
      if (song.artistId) entry.artistId = song.artistId
      if (song.primaryGenreName) entry.genre = song.primaryGenreName
      if (kind === 'start') entry.plays = (entry.plays || 0) + 1
      if (kind === 'complete') entry.completions = (entry.completions || 0) + 1
      if (kind === 'skipEarly') entry.skips = (entry.skips || 0) + 1
      if (kind === 'favorite') entry.favorites = (entry.favorites || 0) + 1
      if (kind === 'unfavorite') entry.favorites = Math.max(0, (entry.favorites || 0) - 1)
      entry.lastPlayed = Date.now()
      taste.artists[artistName] = entry
    }

    const genre = song.primaryGenreName || ''
    if (genre) {
      const entry = taste.genres[genre] || { score: 0 }
      entry.score = (entry.score || 0) + weights.genre
      taste.genres[genre] = entry
    }

    const id = String(song.trackId || '')
    if (id) {
      const entry = taste.tracks[id] || { plays: 0, skips: 0, completions: 0 }
      if (kind === 'start') entry.plays = (entry.plays || 0) + 1
      if (kind === 'complete') entry.completions = (entry.completions || 0) + 1
      if (kind === 'skipEarly') entry.skips = (entry.skips || 0) + 1
      entry.lastPlayed = Date.now()
      taste.tracks[id] = entry
    }

    taste.updatedAt = Date.now()
    saveLibrary()
  }

  function beginPlayWatch(song) {
    playWatch = { song, maxTime: 0, duration: 0 }
  }

  function recordPlayOutcome() {
    if (!playWatch || !playWatch.song) return
    const { song, maxTime, duration } = playWatch
    playWatch = null
    if (!duration || duration <= 0) return
    const fraction = maxTime / duration
    if (fraction >= 0.85) tasteBump(song, 'complete')
    else if (fraction < 0.25) tasteBump(song, 'skipEarly')
    else tasteBump(song, 'skipMid')
  }

  function artistAffinity(name) {
    if (!name) return 0
    const taste = ensureTaste()
    return taste.artists[name]?.score || 0
  }

  function genreAffinity(name) {
    if (!name) return 0
    const taste = ensureTaste()
    return taste.genres[name]?.score || 0
  }

  function topTasteArtists(limit) {
    const taste = ensureTaste()
    return Object.entries(taste.artists)
      .map(([name, data]) => ({ name, ...data }))
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  function topTasteGenres(limit) {
    const taste = ensureTaste()
    return Object.entries(taste.genres)
      .map(([name, data]) => ({ name, score: data.score || 0 }))
      .filter(g => g.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  function trackSeed(song) {
    if (!song) return null
    return { artist: song.artistName || '', title: song.trackName || '' }
  }

  function trackSeedList(list, limit) {
    return (Array.isArray(list) ? list : [])
      .slice(0, limit)
      .map(trackSeed)
      .filter(s => s && s.title)
  }

  async function requestAiQueue(options = {}) {
    const context = Array.isArray(options.context) && options.context.length
      ? options.context
      : library.history
    const body = {
      seed: options.seed || trackSeed(currentSong),
      mood: options.mood || '',
      count: options.count || AI_REFILL_COUNT,
      recent: trackSeedList(context, 20),
      favorites: trackSeedList(library.favorites, 15),
      exclude: trackSeedList(options.exclude || sessionSongs, 60)
    }
    const res = await fetch('/music/ai/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = new Error('ai-queue')
      err.status = res.status
      throw err
    }
    return await res.json()
  }

  async function refillEndlessQueue() {
    await topUpQueue()
  }

  async function fetchCatalogTracks(url) {
    try {
      const res = await fetch(url)
      if (!res.ok) return []
      const data = await res.json()
      return Array.isArray(data.results) ? data.results : []
    } catch {
      return []
    }
  }

  async function gatherCandidates(seed) {
    const requests = []

    if (seed?.artistId || seed?.artistName) {
      const params = new URLSearchParams({ limit: '25' })
      if (seed.artistId) params.set('artistId', String(seed.artistId))
      else params.set('artist', seed.artistName)
      requests.push(fetchCatalogTracks(`/music/catalog/artist?${params}`))
    }

    for (const artist of topTasteArtists(6)) {
      if (seed?.artistName && artist.name === seed.artistName) continue
      const params = new URLSearchParams({ limit: '20' })
      if (artist.artistId) params.set('artistId', String(artist.artistId))
      else params.set('artist', artist.name)
      requests.push(fetchCatalogTracks(`/music/catalog/artist?${params}`))
    }

    const genres = []
    if (seed?.primaryGenreName) genres.push(seed.primaryGenreName)
    for (const genre of topTasteGenres(2)) {
      if (!genres.includes(genre.name)) genres.push(genre.name)
    }
    if (!genres.length && seed?.artistName) {
      const known = ensureTaste().artists[seed.artistName]?.genre
      if (known) genres.push(known)
    }
    for (const genre of genres.slice(0, 2)) {
      requests.push(fetchCatalogTracks(`/music/catalog/genre?genre=${encodeURIComponent(genre)}&limit=25`))
    }

    const batches = await Promise.all(requests)
    const pool = batches.flat()

    for (const track of [...library.favorites, ...library.history.slice(0, 40)]) {
      pool.push(track)
    }
    for (const pl of library.playlists) {
      for (const track of pl.tracks) pool.push(track)
    }

    return pool
  }

  function scoreCandidate(candidate, seed, taste) {
    let score = 0

    const artistScore = artistAffinity(candidate.artistName)
    score += Math.max(-8, Math.min(14, artistScore * 1.6))
    score += Math.max(-4, Math.min(7, genreAffinity(candidate.primaryGenreName) * 0.9))

    if (seed) {
      if (candidate.artistName && candidate.artistName === seed.artistName) score += 7
      if (candidate.primaryGenreName && candidate.primaryGenreName === seed.primaryGenreName) score += 4
    }

    const trackStats = taste.tracks[String(candidate.trackId)] || null
    if (trackStats) {
      if (trackStats.completions) score += Math.min(5, trackStats.completions * 1.5)
      if (trackStats.skips) score -= Math.min(10, trackStats.skips * 3)
      const sinceDays = (Date.now() - (trackStats.lastPlayed || 0)) / 86400000
      if (sinceDays < 0.08) score -= 14
      else if (sinceDays < 1) score -= 5
    } else {
      score += 3
    }

    if (isFavorite(candidate)) score += 6
    if (candidate.community) score -= 3
    score += Math.random() * 2.5

    return score
  }

  function diversify(sorted, count) {
    const picked = []
    const used = new Set()
    const perArtist = new Map()
    let lastArtist = null
    const artistCap = Math.max(3, Math.ceil(count / 3))

    const take = (item) => {
      picked.push(item)
      used.add(item)
      const artist = item.track.artistName || ''
      perArtist.set(artist, (perArtist.get(artist) || 0) + 1)
      lastArtist = artist
    }

    for (const item of sorted) {
      if (picked.length >= count) break
      if (used.has(item)) continue

      const artist = item.track.artistName || ''
      if ((perArtist.get(artist) || 0) >= artistCap) continue

      if (artist && artist === lastArtist && picked.length) {
        const alternative = sorted.find(o =>
          !used.has(o) &&
          (o.track.artistName || '') !== artist &&
          (perArtist.get(o.track.artistName || '') || 0) < artistCap
        )
        if (alternative) {
          take(alternative)
          continue
        }
      }

      take(item)
    }

    return picked.map(p => p.track)
  }

  function seedKeyFor(song) {
    if (!song) return 'none'
    return `${song.artistName || ''}|${song.primaryGenreName || ''}`
  }

  async function ensureCandidatePool(seed, force) {
    const key = seedKeyFor(seed)
    const fresh = Date.now() - candidatePool.at < CANDIDATE_TTL_MS
    if (!force && candidatePool.key === key && fresh && candidatePool.tracks.length) {
      return candidatePool.tracks
    }

    const pool = await gatherCandidates(seed)
    const unique = []
    const dedupeKeys = new Set()

    for (const track of pool) {
      if (!track?.trackId || !track.trackName) continue
      if (DERIVATIVE_TITLE.test(track.trackName)) continue
      if (DERIVATIVE_ARTIST_NAME.test(track.artistName || '')) continue
      const key = songIdentity(track)
      if (dedupeKeys.has(key)) continue
      dedupeKeys.add(key)
      unique.push(track)
    }

    candidatePool = { key, tracks: unique, at: Date.now() }
    return unique
  }

  async function buildTasteContinuation(count, options = {}) {
    if (count <= 0) return []
    const seed = currentSong || queue[queueIndex] || queue[0]
    const taste = ensureTaste()

    let pool = await ensureCandidatePool(seed, options.force)
    let available = filterAvailable(pool)

    if (available.length < count && !options.force) {
      pool = await ensureCandidatePool(seed, true)
      available = filterAvailable(pool)
    }
    if (!available.length) return []

    const scored = available
      .map(track => ({ track, score: scoreCandidate(track, seed, taste) }))
      .sort((a, b) => b.score - a.score)

    return diversify(scored, count)
  }

  function filterAvailable(pool) {
    const queued = new Set(sessionTrackKeys)
    const queuedIds = new Set(queue.map(t => String(t.trackId)))
    return pool.filter(t => {
      const key = coreTrackKey(t) || songIdentity(t)
      return !queuedIds.has(String(t.trackId)) && !queued.has(key)
    })
  }

  function appendAutoplayTracks(tracks) {
    const additions = dedupeTracks(tracks).filter(song => {
      const key = coreTrackKey(song) || songIdentity(song)
      return key && !sessionTrackKeys.has(key)
    })
    if (!additions.length) return []
    queue.push(...additions)
    registerSessionTracks(additions)
    return additions
  }

  function appendFromPool(pool, count) {
    const added = []
    while (pool.length && added.length < count) {
      added.push(...appendAutoplayTracks([pool.shift()]))
    }
    return added
  }

  async function buildAiAutoplayPool() {
    if (!aiEnabled || !queueContext.algorithmContext.length) return []
    try {
      const data = await requestAiQueue({
        count: QUEUE_LOOKAHEAD,
        context: queueContext.algorithmContext,
        exclude: sessionSongs
      })
      return dedupeTracks(Array.isArray(data.results) ? data.results : []).filter(song => {
        const key = coreTrackKey(song) || songIdentity(song)
        return key && !sessionTrackKeys.has(key)
      })
    } catch {
      return []
    }
  }

  async function topUpQueue() {
    if (!library.settings.endless) return
    if (topUpBusy) return
    if (!currentSong && !queue.length) return

    if (queueContext.finiteEnd >= 0) {
      if (queueIndex < queueContext.finiteEnd) return
      queueContext.finiteEnd = -1
      queueContext.phase = 'algorithm'
      queueContext.algorithmContext = []
      queueContext.algorithmPool = []
      queueContext.aiPool = []
      showToast('Autoplay started')
    }

    const missing = QUEUE_LOOKAHEAD - (queue.length - Math.max(0, queueIndex + 1))
    if (missing <= 0) return

    topUpBusy = true
    try {
      let added = []

      if (queueContext.phase === 'ai') {
        if (!queueContext.aiPool.length) queueContext.aiPool = await buildAiAutoplayPool()
        if (queueContext.aiPool.length) {
          added = appendFromPool(queueContext.aiPool, missing)
          if (!queueContext.aiPool.length) queueContext.phase = 'algorithm'
        } else {
          queueContext.phase = 'algorithm'
        }
      }

      if (!added.length && queueContext.phase === 'algorithm') {
        if (!queueContext.algorithmPool.length) {
          let algorithmBatch = await buildTasteContinuation(QUEUE_LOOKAHEAD)
          if (algorithmBatch.length < QUEUE_LOOKAHEAD) {
            algorithmBatch = dedupeTracks([
              ...algorithmBatch,
              ...await radioFallback(QUEUE_LOOKAHEAD - algorithmBatch.length)
            ]).filter(song => {
              const key = coreTrackKey(song) || songIdentity(song)
              return key && !sessionTrackKeys.has(key)
            })
          }
          queueContext.algorithmContext = algorithmBatch.slice(0, QUEUE_LOOKAHEAD)
          queueContext.algorithmPool = [...queueContext.algorithmContext]
          queueContext.aiPool = []
        }

        added = appendFromPool(queueContext.algorithmPool, missing)
        if (!queueContext.algorithmPool.length) {
          queueContext.phase = aiEnabled && queueContext.algorithmContext.length ? 'ai' : 'algorithm'
        }
      }

      if (added.length) renderQueue()
    } finally {
      topUpBusy = false
    }
  }

  async function radioFallback(count) {
    const seed = currentSong || queue[queueIndex] || queue[0]
    if (!seed) return []
    const topArtist = topTasteArtists(1)[0]?.name
    const query = seed.artistName
      ? `${seed.artistName} songs`
      : topArtist
        ? `${topArtist} songs`
        : buildSearchQueryFromSong(seed)
    try {
      const res = await fetch(`/music/radio?q=${encodeURIComponent(query)}`)
      if (!res.ok) return []
      const data = await res.json()
      const rows = Array.isArray(data.results) ? data.results : []
      const queuedIds = new Set(queue.map(t => String(t.trackId)))
      const queuedKeys = new Set(sessionTrackKeys)
      return rows
        .filter(t => {
          const key = coreTrackKey(t) || songIdentity(t)
          return t?.trackId && !queuedIds.has(String(t.trackId)) && !queuedKeys.has(key)
        })
        .slice(0, count)
    } catch {
      return []
    }
  }

  function syncEndlessUI() {
    const on = Boolean(library.settings.endless)
    endlessBtn.classList.toggle('is-active', on)
    endlessBtn.setAttribute('aria-pressed', String(on))
    endlessMark.hidden = !on
  }

  async function buildAiQueueNow() {
    if (!aiEnabled) {
      showToast('AI is not configured')
      return
    }
    if (aiBusy) return
    aiBusy = true
    aiQueueBtn.disabled = true
    showToast('Building a queue')
    try {
      const data = await requestAiQueue({ count: 14 })
      const tracks = Array.isArray(data.results) ? data.results : []
      if (!tracks.length) throw new Error('empty')
      setQueue(tracks, 0)
      showToast(data.title ? `Queue: ${data.title}` : 'Queue ready')
      showTab('player')
    } catch (e) {
      showToast(e.status === 429 ? 'AI is rate limited, try again shortly' : 'Could not build a queue')
    } finally {
      aiBusy = false
      aiQueueBtn.disabled = false
    }
  }

  async function loadAiMixes(force) {
    if (!aiEnabled) return
    const artists = eligibleMixArtists()
    if (!artists.length) {
      renderMixes()
      return
    }
    if (aiBusy && !force) return

    const cached = readMixCache()
    if (cached && !force) {
      renderMixes(cached)
      return
    }

    aiBusy = true
    if (refreshMixesBtn) refreshMixesBtn.disabled = true
    try {
      const res = await fetch('/music/ai/mixes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recent: trackSeedList(library.history, 25),
          favorites: trackSeedList(library.favorites, 15),
          artists: artists.map(artist => ({
            name: artist.name,
            plays: artist.plays || 0,
            seeds: trackSeedList(
              [...library.history, ...library.favorites].filter(song => song.artistName === artist.name),
              12
            )
          })),
          count: artists.length,
          perMix: 18
        })
      })
      if (!res.ok) throw new Error('mixes')
      const data = await res.json()
      if (Array.isArray(data.mixes) && data.mixes.length) {
        writeMixCache(data.mixes)
        renderMixes(data.mixes)
      }
    } catch {
      if (force) showToast('Could not regenerate mixes')
    } finally {
      aiBusy = false
      if (refreshMixesBtn) refreshMixesBtn.disabled = false
    }
  }

  function readMixCache() {
    try {
      const raw = localStorage.getItem('music-ai-mixes-v2')
      if (!raw) return null
      const parsed = JSON.parse(raw)
      if (!parsed || Date.now() > parsed.expiresAt) return null
      return Array.isArray(parsed.mixes) ? parsed.mixes : null
    } catch {
      return null
    }
  }

  function writeMixCache(mixes) {
    try {
      localStorage.setItem('music-ai-mixes-v2', JSON.stringify({
        mixes,
        expiresAt: Date.now() + 6 * 60 * 60 * 1000
      }))
    } catch {}
  }

  function startRadio(query) {
    if (!query) return
    setStatus('Starting radio')
    showToast('Starting radio')
    fetch(`/music/radio?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(d => {
        const items = Array.isArray(d.results) ? d.results : []
        if (!items.length) throw new Error('no-radio')
        setQueue(items, 0)
        showTab('player')
      })
      .catch(() => {
        setStatus('')
        showToast('Unable to start radio')
      })
  }


  async function playSong(song) {
    if (!song) return
    if (!queue.some(s => s.trackId === song.trackId)) {
      queue.push(song)
      registerSessionTracks([song])
      queueIndex = queue.length - 1
    } else {
      queueIndex = queue.findIndex(s => s.trackId === song.trackId)
    }

    setStatus('Loading')
    crossfadeArmed = false
    recordPlayOutcome()
    invalidateNextPlan()
    activeAudio.pause()
    resetWaveformAudio(activeAudio)
    activeAudio.removeAttribute('src')
    activeAudio.load()
    currentSong = song
    applySongUI(song)
    refillEndlessQueue()
    renderQueue()
    syncPlayUI()

    try {
      await prepareAudio(activeAudio, song, true)
      setStatus('')
      syncPlayUI()
      planNextTrack()
      preloadNextTrack()
    } catch {
      setStatus('Unable to play this track')
      showToast('Unable to play this track', buildInvidiousAction(song))
      activeAudio.pause()
      activeAudio.removeAttribute('src')
      activeAudio.load()
      syncPlayUI()
    }
  }

  function applySongUI(song) {
    waveformLastSignal = Date.now()
    const title = song.trackName || 'Unknown'
    const artist = song.artistName || song.collectionName || ''
    setTrackTitle(songTitle, title, song)
    artistName.textContent = artist
    setTrackTitle(nowTitle, title, song)
    nowArtist.textContent = artist
    setArtwork(artFor(song, true))
    updateFavoriteUI()
    renderUpNext()
    beginPlayWatch(song)
    tasteBump(song, 'start')
    rememberHistory(song)
    loadLyricsForSong(song)
    updateMediaSession(song)
  }

  function updateMediaSession(song) {
    if (!('mediaSession' in navigator)) return
    const url = artFor(song, true)
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.trackName || 'Unknown',
        artist: song.artistName || '',
        album: song.collectionName || '',
        artwork: url ? [{ src: url, sizes: '512x512', type: 'image/jpeg' }] : []
      })
      navigator.mediaSession.setActionHandler('play', () => togglePlay())
      navigator.mediaSession.setActionHandler('pause', () => togglePlay())
      navigator.mediaSession.setActionHandler('previoustrack', () => prevSong())
      navigator.mediaSession.setActionHandler('nexttrack', () => nextSong(true))
    } catch {}
  }

  function buildInvidiousAction(song) {
    if (!invidiousUrl || !song) return null
    const target = song.videoId
      ? `${invidiousUrl}/watch?v=${encodeURIComponent(song.videoId)}`
      : `${invidiousUrl}/search?q=${encodeURIComponent(buildSearchQueryFromSong(song))}`
    return {
      label: 'Open in Invidious',
      run: () => window.open(target, '_blank', 'noopener,noreferrer')
    }
  }

  function togglePlay() {
    if (!activeAudio.src) {
      if (queue.length) playSong(queue[Math.max(0, queueIndex)])
      return
    }
    if (activeAudio.paused) activeAudio.play().catch(() => {})
    else activeAudio.pause()
    syncPlayUI()
  }

  function prevSong() {
    if (!queue.length) return
    if (activeAudio.currentTime > 3) {
      activeAudio.currentTime = 0
      resetLyricTracking()
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
      resetLyricTracking()
      activeAudio.play().catch(() => {})
      return
    }
    const nextIdx = getNextIndex()
    if (nextIdx === -1) {
      if (library.settings.endless) {
        topUpQueue().then(() => {
          invalidateNextPlan()
          const retry = getNextIndex()
          if (retry !== -1 && queue[retry]) playSong(queue[retry])
          else {
            activeAudio.pause()
            syncPlayUI()
          }
        })
        return
      }
      activeAudio.pause()
      syncPlayUI()
      return
    }
    const s = queue[nextIdx]
    if (s) playSong(s)
  }


  favBtn.addEventListener('click', () => toggleFavoriteFor(currentSong))
  favChip.addEventListener('click', () => toggleFavoriteFor(currentSong))
  playBtn.addEventListener('click', togglePlay)
  prevBtn.addEventListener('click', prevSong)
  nextBtn.addEventListener('click', () => nextSong(true))

  shuffleBtn.addEventListener('click', () => {
    library.settings.shuffle = !library.settings.shuffle
    saveLibrary()
    syncPlayUI()
    renderUpNext()
    invalidateNextPlan()
    planNextTrack()
    preloadNextTrack()
  })

  repeatBtn.addEventListener('click', () => {
    const order = ['off', 'all', 'one']
    const idx = order.indexOf(library.settings.repeat)
    library.settings.repeat = order[(idx + 1) % order.length]
    saveLibrary()
    syncPlayUI()
    invalidateNextPlan()
    planNextTrack()
    preloadNextTrack()
  })

  muteBtn.addEventListener('click', toggleMute)
  volumeSlider.addEventListener('input', setVolumeFromSlider)

  nowTitle.addEventListener('click', () => showTab('player'))

  expandBtn.addEventListener('click', () => {
    if (currentView === 'player') showTab(previousView === 'player' ? 'home' : previousView)
    else showTab('player')
  })

  function isFullscreen() {
    return Boolean(document.fullscreenElement || document.webkitFullscreenElement)
  }

  function syncFullscreenUI() {
    const active = isFullscreen()
    document.body.classList.toggle('is-player-fullscreen', active)
    fullscreenIcon.textContent = active ? 'fullscreen_exit' : 'fullscreen'
    fullscreenLabel.textContent = active ? 'Exit fullscreen' : 'Fullscreen'
    fullscreenChip.classList.toggle('is-active', active)
    syncNowPlayingLayout()
  }

  upNextToggleChip.addEventListener('click', () => {
    library.settings.showUpNext = library.settings.showUpNext === false
    saveLibrary()
    syncNowPlayingLayout()
  })

  fullscreenLyricsToggle.addEventListener('click', () => {
    library.settings.fullscreenLyrics = library.settings.fullscreenLyrics === false
    saveLibrary()
    syncNowPlayingLayout()
  })

  fullscreenChip.addEventListener('click', async () => {
    try {
      if (isFullscreen()) {
        if (document.exitFullscreen) await document.exitFullscreen()
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
        return
      }
      showTab('player')
      const root = document.documentElement
      if (root.requestFullscreen) await root.requestFullscreen()
      else if (root.webkitRequestFullscreen) root.webkitRequestFullscreen()
      else showToast('Fullscreen is not supported here')
    } catch {
      showToast('Fullscreen was blocked')
    } finally {
      setTimeout(syncFullscreenUI, 500)
    }
  })

  function handleFullscreenChange() {
    syncFullscreenUI()
    setTimeout(syncFullscreenUI, 300)
    requestAnimationFrame(() => {
      updateLyricPadding()
      recenterLyrics(true)
    })
  }

  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  window.addEventListener('resize', () => setTimeout(syncFullscreenUI, 0))

  miniLyricsBtn.addEventListener('click', () => showTab('lyrics'))
  miniQueueBtn.addEventListener('click', () => showTab('queue'))
  openQueueBtn.addEventListener('click', () => showTab('queue'))
  heroSearchBtn.addEventListener('click', () => showTab('search'))
  radioChip.addEventListener('click', () => {
    if (!currentSong) {
      showToast('Play a track first')
      return
    }
    startRadio(`${buildSearchQueryFromSong(currentSong)} radio`)
  })
  addPlaylistChip.addEventListener('click', () => openPlaylistSheet(currentSong))

  heroPlayBtn.addEventListener('click', () => {
    if (currentSong) {
      togglePlay()
      showTab('player')
      return
    }
    const first = library.history[0]
    if (first) {
      setQueue(library.history.slice(0, 25), 0)
      showTab('player')
      return
    }
    showTab('search')
  })

  endlessBtn.addEventListener('click', () => {
    library.settings.endless = !library.settings.endless
    saveLibrary()
    syncEndlessUI()
    if (library.settings.endless) {
      showToast('Endless queue on')
      refillEndlessQueue()
    } else {
      showToast('Endless queue off')
    }
  })

  aiQueueBtn.addEventListener('click', buildAiQueueNow)
  refreshMixesBtn.addEventListener('click', () => {
    localStorage.removeItem('music-deleted-mixes-v1')
    loadAiMixes(true)
  })

  clearQueueBtn.addEventListener('click', () => {
    clearQueue()
    showToast('Queue cleared')
  })

  playNextFromFavsBtn.addEventListener('click', () => {
    if (!library.favorites.length) {
      showToast('No favorites yet')
      return
    }
    library.favorites.forEach(f => queue.splice(queueIndex + 1, 0, f))
    renderQueue()
    showToast('Favorites queued')
  })

  shuffleQueueBtn.addEventListener('click', () => {
    if (queue.length < 2) return
    const current = queue[queueIndex]
    const rest = queue.filter((_, i) => i !== queueIndex)
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = rest[i]
      rest[i] = rest[j]
      rest[j] = tmp
    }
    queue = current ? [current, ...rest] : rest
    queueIndex = current ? 0 : -1
    renderQueue()
    showToast('Queue shuffled')
  })

  addCurrentToPlaylistBtn.addEventListener('click', () => {
    if (!currentSong) {
      showToast('Play a track first')
      return
    }
    if (selectedPlaylistId) {
      addTrackToPlaylist(selectedPlaylistId, currentSong)
      return
    }
    openPlaylistSheet(currentSong)
  })


  function handlePlayPause(e) {
    if (!e.target.paused && !e.target.ended) {
      ensureWaveformAudio(e.target)
      if (e.type === 'playing') verifyWaveformPlayback(e.target)
    } else {
      stopWaveformCheck(e.target)
    }
    if (e.target !== activeAudio) return
    syncPlayUI()
    renderHero()
  }

  function handleEnded(e) {
    if (e.target !== activeAudio) return
    if (playWatch && Number.isFinite(activeAudio.duration)) {
      playWatch.maxTime = activeAudio.duration
      playWatch.duration = activeAudio.duration
    }
    recordPlayOutcome()
    syncPlayUI()
    crossfadeArmed = false
    const planned = getPlannedNext()
    if (planned && preloadAudio.dataset.trackId === String(planned.song.trackId || '') && preloadAudio.readyState >= 2) {
      swapPlayers()
      currentSong = planned.song
      queueIndex = planned.index
      invalidateNextPlan()
      applySongUI(currentSong)
      renderQueue()
      activeAudio.play().catch(() => {})
      planNextTrack()
      preloadNextTrack()
      topUpQueue()
      return
    }
    nextSong()
  }

  function handleTime(e) {
    if (e.target !== activeAudio) return
    if (isScrubbing) return
    if (activeAudio.currentTime > 0 && !activeAudio.paused && !waveformSources.has(activeAudio)) {
      verifyWaveformPlayback(activeAudio)
    }
    if (playWatch) {
      if (activeAudio.currentTime > playWatch.maxTime) playWatch.maxTime = activeAudio.currentTime
      if (Number.isFinite(activeAudio.duration) && activeAudio.duration > 0) playWatch.duration = activeAudio.duration
    }
    syncProgressUI()
    ensureNextReady()
    handleCrossfade()
  }

  function handleMetadata(e) {
    if (e.target !== activeAudio) return
    syncProgressUI()
    improveLyricMatch()
  }

  function handleVolume(e) {
    if (e.target !== activeAudio) return
    updateMuteGlyph()
    updateVolumeSliderTrack()
  }

  function handleError(e) {
    if (e.target !== activeAudio) return
    resetWaveformAudio(activeAudio)
    if (activeAudio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      setStatus('Unable to play this track')
      syncPlayUI()
    }
  }

  function attachAudioListeners(el) {
    el.addEventListener('play', handlePlayPause)
    el.addEventListener('playing', handlePlayPause)
    el.addEventListener('canplay', () => {
      if (!el.paused && !el.ended) verifyWaveformPlayback(el)
    })
    el.addEventListener('pause', handlePlayPause)
    el.addEventListener('ended', handleEnded)
    el.addEventListener('timeupdate', handleTime)
    el.addEventListener('loadedmetadata', handleMetadata)
    el.addEventListener('durationchange', handleMetadata)
    el.addEventListener('volumechange', handleVolume)
    el.addEventListener('error', handleError)
    el.addEventListener('seeked', resetLyricTracking)
  }

  attachAudioListeners(audioA)
  attachAudioListeners(audioB)


  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName
    const typing = tag === 'INPUT' || tag === 'TEXTAREA'

    if (e.key === 'Escape' && !playlistCreateSheet.hidden) {
      closeCreatePlaylistDialog()
      return
    }

    if (e.key === 'Escape' && !playlistSheet.hidden) {
      closePlaylistSheet()
      return
    }

    if (typing) return

    if (e.key === ' ') {
      e.preventDefault()
      togglePlay()
    } else if (e.key === 'ArrowRight' && e.shiftKey) {
      nextSong(true)
    } else if (e.key === 'ArrowLeft' && e.shiftKey) {
      prevSong()
    } else if (e.key === '/') {
      e.preventDefault()
      showTab('search')
    } else if (e.key.toLowerCase() === 'l') {
      showTab('lyrics')
    }
  })


  applyAudioVolumeState()

  applyRailState()
  applyLyricSize()
  lyricsSyncToggle.classList.toggle('is-active', library.settings.syncedLyrics)
  lyricsSyncToggle.setAttribute('aria-pressed', String(library.settings.syncedLyrics))

  updateMuteGlyph()
  updateVolumeSliderTrack()
  updateFavoriteUI()
  setArtwork('')
  setStatus('')
  setProgressPct(0)
  ensureTaste()
  decayTaste()
  syncCommunityToggle()
  syncEndlessUI()
  setTranslateLabel('Translate', library.settings.translateLyrics)

  renderFavorites()
  renderPlaylists()
  renderHome()
  renderQueue()
  renderSearch()
  syncPlayUI()
  loadLyricsForSong(null)
  tickLyrics()

  fetch('/music/ai/status')
    .then(r => r.json())
    .then(d => {
      aiEnabled = Boolean(d?.enabled)
      invidiousUrl = String(d?.invidiousUrl || '').replace(/\/+$/, '')
      syncEndlessUI()
      if (!aiEnabled) {
        aiQueueBtn.disabled = true
        refreshMixesBtn.hidden = true
        return
      }
      loadAiMixes(false)
    })
    .catch(() => {
      aiEnabled = false
      syncEndlessUI()
    })

})
