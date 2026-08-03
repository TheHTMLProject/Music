window.addEventListener('DOMContentLoaded', () => {

  const $ = (id) => document.getElementById(id)

  const audioA = $('audioPrimary')
  const audioB = $('audioSecondary')
  let activeAudio = audioA
  let preloadAudio = audioB

  const ambient = $('ambient')
  const navRail = $('navRail')
  const railToggle = $('railToggle')
  const themeToggle = $('themeToggle')
  const themeIcon = $('themeIcon')
  const themeLabel = $('themeLabel')
  const queueBadge = $('queueBadge')

  const viewTitle = $('viewTitle')
  const viewSubtitle = $('viewSubtitle')

  const searchInput = $('searchInput')
  const searchBtn = $('searchBtn')
  const searchClear = $('searchClear')
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
  const lyricsOffsetUp = $('lyricsOffsetUp')
  const lyricsOffsetDown = $('lyricsOffsetDown')
  const lyricsOffsetValue = $('lyricsOffsetValue')

  const queueList = $('queueList')
  const clearQueueBtn = $('clearQueueBtn')
  const playNextFromFavsBtn = $('playNextFromFavsBtn')
  const shuffleQueueBtn = $('shuffleQueueBtn')

  const playlistsList = $('playlistsList')
  const playlistDetailTracks = $('playlistDetailTracks')
  const playlistDetailTitle = $('playlistDetailTitle')
  const newPlaylistName = $('newPlaylistName')
  const createPlaylistBtn = $('createPlaylistBtn')
  const addCurrentToPlaylistBtn = $('addCurrentToPlaylistBtn')

  const favoritesGrid = $('favoritesGrid')
  const favoritesEmpty = $('favoritesEmpty')

  const nowArt = $('nowArt')
  const nowTitle = $('nowTitle')
  const nowArtist = $('nowArtist')
  const nowLine = $('nowLine')
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

  const progressBar = $('progressBar')
  const progress = $('progress')
  const progressThumb = $('progressThumb')
  const currentTimeEl = $('currentTime')
  const durationEl = $('duration')

  const toast = $('toast')
  const playlistSheet = $('playlistSheet')
  const sheetPlaylists = $('sheetPlaylists')
  const sheetClose = $('sheetClose')

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  const deepClone = (obj) => (typeof structuredClone === 'function' ? structuredClone(obj) : JSON.parse(JSON.stringify(obj)))

  const defaultLibrary = {
    favorites: [],
    playlists: [],
    history: [],
    settings: {
      volume: 0.7,
      shuffle: false,
      repeat: 'off',
      crossfade: true,
      gapless: true,
      railExpanded: false,
      syncedLyrics: true,
      lyricsCompact: false,
      lyricOffsets: {}
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
  let selectedPlaylistId = null
  let lastResults = []
  let activeFilter = 'all'
  let pendingPlaylistTrack = null
  let toastTimer = null

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

  function setStatus(text) {
    statusText.textContent = text || ''
  }

  function showToast(message) {
    if (!message) return
    toast.textContent = message
    toast.hidden = false
    requestAnimationFrame(() => toast.classList.add('is-visible'))
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible')
      setTimeout(() => { toast.hidden = true }, 260)
    }, 2600)
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


  const THEME_ORDER = ['auto', 'light', 'dark']
  const THEME_GLYPH = { auto: 'brightness_auto', light: 'light_mode', dark: 'dark_mode' }
  const THEME_TEXT = { auto: 'System', light: 'Light', dark: 'Dark' }

  function readTheme() {
    if (window.THPTheme && typeof window.THPTheme.get === 'function') {
      const value = window.THPTheme.get()
      if (THEME_ORDER.includes(value)) return value
    }
    const attr = document.documentElement.getAttribute('data-theme')
    return THEME_ORDER.includes(attr) ? attr : 'auto'
  }

  function writeTheme(next) {
    if (window.THPTheme) {
      if (next === 'auto' && typeof window.THPTheme.system === 'function') {
        window.THPTheme.system()
        syncThemeUI()
        return
      }
      if (typeof window.THPTheme.set === 'function') {
        window.THPTheme.set(next)
        syncThemeUI()
        return
      }
    }
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('theme', next) } catch {}
    syncThemeUI()
  }

  function syncThemeUI() {
    const value = readTheme()
    themeIcon.textContent = THEME_GLYPH[value] || 'brightness_auto'
    themeLabel.textContent = THEME_TEXT[value] || 'System'
    themeToggle.setAttribute('aria-label', `Theme: ${THEME_TEXT[value] || 'System'}`)
  }

  themeToggle.addEventListener('click', () => {
    const value = readTheme()
    const next = THEME_ORDER[(THEME_ORDER.indexOf(value) + 1) % THEME_ORDER.length]
    writeTheme(next)
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
    el.src = buildAudioSrc(vid)
    el.load()
    el.dataset.trackId = song.trackId
    if (autoplay) await el.play()
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
    if (!next || preloadAudio.dataset.trackId !== String(next.trackId || '') || preloadAudio.readyState < 2) return
    if (crossfadeArmed) return
    const remaining = activeAudio.duration - activeAudio.currentTime
    if (remaining <= 1.2 && remaining > 0) {
      crossfadeArmed = true
      preloadAudio.currentTime = 0
      preloadAudio.volume = activeAudio.volume
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

  function getNextTrack() {
    const idx = getNextIndex()
    return idx === -1 ? null : queue[idx]
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
    if (library.settings.shuffle) return queueIndex
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
    shuffleBtn.setAttribute('aria-pressed', String(library.settings.shuffle))
    repeatBtn.classList.toggle('is-active', library.settings.repeat !== 'off')
    repeatBtn.setAttribute('aria-pressed', String(library.settings.repeat !== 'off'))
    repeatIcon.textContent = library.settings.repeat === 'one' ? 'repeat_one' : 'repeat'
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'
    }
  }

  function updateMuteGlyph() {
    const muted = activeAudio.muted || activeAudio.volume === 0
    muteIcon.textContent = muted ? 'volume_off' : activeAudio.volume < 0.5 ? 'volume_down' : 'volume_up'
    muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute')
  }

  function updateVolumeSliderTrack() {
    const value = Math.max(0, Math.min(100, Number(volumeSlider.value)))
    const styles = getComputedStyle(document.documentElement)
    const track = styles.getPropertyValue('--outline-variant').trim() || '#d1d1d1'
    const brand = styles.getPropertyValue('--primary').trim() || '#2a844a'
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
    } else {
      activeAudio.muted = false
      preloadAudio.muted = false
      const v = lastVolume > 0 ? lastVolume : 0.7
      activeAudio.volume = v
      preloadAudio.volume = v
      volumeSlider.value = Math.round(v * 100)
    }
    updateMuteGlyph()
    updateVolumeSliderTrack()
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

  function seekToClientX(clientX) {
    const dur = activeAudio.duration
    if (!Number.isFinite(dur) || dur <= 0) return
    const rect = progressBar.getBoundingClientRect()
    if (!rect.width) return
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    activeAudio.currentTime = dur * pct
    currentTimeEl.textContent = fmtTime(activeAudio.currentTime)
    setProgressPct(pct * 100)
  }

  function onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (!activeAudio.src) return
    e.preventDefault()
    isScrubbing = true
    progressBar.classList.add('is-scrubbing')
    wasPlayingBeforeScrub = !activeAudio.paused && !activeAudio.ended
    try { activeAudio.pause() } catch {}
    try { progressBar.setPointerCapture(e.pointerId) } catch {}
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
    progressBar.classList.remove('is-scrubbing')
    try { progressBar.releasePointerCapture(e.pointerId) } catch {}
    resetLyricTracking()
    if (wasPlayingBeforeScrub) activeAudio.play().catch(() => {})
  }

  progressBar.addEventListener('pointerdown', onPointerDown)
  progressBar.addEventListener('pointermove', onPointerMove)
  progressBar.addEventListener('pointerup', onPointerUp)
  progressBar.addEventListener('pointercancel', onPointerUp)

  progressBar.addEventListener('keydown', (e) => {
    if (!Number.isFinite(activeAudio.duration) || activeAudio.duration <= 0) return
    if (e.key === 'ArrowRight') {
      activeAudio.currentTime = Math.min(activeAudio.duration, activeAudio.currentTime + 5)
      e.preventDefault()
    } else if (e.key === 'ArrowLeft') {
      activeAudio.currentTime = Math.max(0, activeAudio.currentTime - 5)
      e.preventDefault()
    }
    resetLyricTracking()
  })


  const lyricViews = [
    { scroll: nowLyricsScroll, lines: nowLyricsLines, empty: nowLyricsEmpty, nodes: [], holdUntil: 0 },
    { scroll: lyricsScroll, lines: lyricsLines, empty: lyricsEmpty, nodes: [], holdUntil: 0 }
  ]

  let lyricState = { synced: [], plain: '', offsetMs: 0, instrumental: false, matchedDuration: null }
  let lyricsToken = 0
  let lyricsRematched = false
  let lastLyricIndex = -2
  let lastFillPct = -1

  const OFFSET_STEP = 0.5

  function offsetKeyFor(song) {
    if (!song) return ''
    return String(song.trackId || `${song.trackName}|${song.artistName}`)
  }

  function getLyricOffset() {
    const key = offsetKeyFor(currentSong)
    if (!key) return 0
    const value = Number(library.settings.lyricOffsets?.[key])
    return Number.isFinite(value) ? value : 0
  }

  function setLyricOffset(seconds) {
    const key = offsetKeyFor(currentSong)
    if (!key) return
    if (!library.settings.lyricOffsets) library.settings.lyricOffsets = {}
    const clamped = Math.max(-30, Math.min(30, Math.round(seconds * 10) / 10))
    if (clamped === 0) delete library.settings.lyricOffsets[key]
    else library.settings.lyricOffsets[key] = clamped
    saveLibrary()
    resetLyricTracking()
    updateOffsetUI()
  }

  function updateOffsetUI() {
    const value = getLyricOffset()
    const sign = value > 0 ? '+' : ''
    lyricsOffsetValue.textContent = `${sign}${value.toFixed(1)}s`
    lyricsOffsetValue.classList.toggle('is-shifted', value !== 0)
  }

  function updateLyricHint() {
    const audioDur = activeAudio.duration
    const matched = lyricState.matchedDuration
    if (!lyricState.synced.length || !Number.isFinite(audioDur) || !Number.isFinite(matched)) {
      lyricsHint.hidden = true
      return
    }
    const diff = audioDur - matched
    if (Math.abs(diff) < 3) {
      lyricsHint.hidden = true
      return
    }
    const longer = diff > 0 ? 'longer' : 'shorter'
    lyricsHint.textContent = `This stream is ${Math.abs(Math.round(diff))}s ${longer} than the reference track, so timing may drift. Use the offset control to line it up.`
    lyricsHint.hidden = false
  }

  function parseLRC(raw) {
    const rows = String(raw || '').split(/\r?\n/)
    const stampRe = /\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g
    const lines = []
    let offsetMs = 0

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
      let text = row.slice(last.index + last[0].length)
      text = text.replace(/<\d{1,3}:\d{1,2}(?:[.:]\d{1,3})?>/g, '').trim()

      for (const stamp of stamps) {
        const minutes = Number(stamp[1]) || 0
        const seconds = Number(stamp[2]) || 0
        let fraction = 0
        if (stamp[3]) {
          const digits = stamp[3]
          const value = Number(digits) || 0
          fraction = digits.length === 1 ? value * 100 : digits.length === 2 ? value * 10 : value
        }
        lines.push({ timeMs: minutes * 60000 + seconds * 1000 + fraction, text })
      }
    }

    lines.sort((a, b) => a.timeMs - b.timeMs)
    for (let i = 0; i < lines.length; i++) {
      lines[i].endMs = i + 1 < lines.length ? lines[i + 1].timeMs : Number.POSITIVE_INFINITY
    }
    return { lines, offsetMs }
  }

  function hasSyncedLyrics() {
    return lyricState.synced.length > 0 && library.settings.syncedLyrics
  }

  function resetLyricTracking() {
    lastLyricIndex = -2
    lastFillPct = -1
  }

  function clearLyricViews() {
    for (const view of lyricViews) {
      view.lines.innerHTML = ''
      view.nodes = []
      view.scroll.classList.remove('karaoke')
    }
    resetLyricTracking()
    setNowLine('')
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

  function renderLyrics() {
    clearLyricViews()
    const synced = hasSyncedLyrics()

    if (lyricState.instrumental && !lyricState.synced.length && !lyricState.plain) {
      setLyricsEmptyState('This track is instrumental')
      lyricsBadge.hidden = true
      return
    }

    if (synced) {
      showLyricViews()
      lyricsBadge.hidden = false
      for (const view of lyricViews) {
        view.scroll.classList.add('karaoke')
        const frag = document.createDocumentFragment()
        lyricState.synced.forEach((line, index) => {
          const node = document.createElement('button')
          node.type = 'button'
          node.className = 'lyric-line'
          if (!line.text) node.classList.add('is-instrumental')
          const span = document.createElement('span')
          span.className = 'lyric-text'
          span.textContent = line.text || '· · ·'
          node.appendChild(span)
          node.addEventListener('click', () => seekToLyric(index))
          frag.appendChild(node)
          view.nodes.push(node)
        })
        view.lines.appendChild(frag)
      }
      updateLyricPadding()
      recenterLyrics(true)
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
      return
    }

    lyricsBadge.hidden = true
    setLyricsEmptyState(currentSong ? 'No lyrics found for this track' : 'Lyrics appear here while a track plays')
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
    activeAudio.currentTime = Math.max(0, (line.timeMs - lyricState.offsetMs) / 1000 + getLyricOffset())
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
        if (i !== index) node.style.removeProperty('--fill')
      })
      if (index >= 0) centerLyricLine(view, view.nodes[index], immediate)
    }
    const text = index >= 0 ? lyricState.synced[index]?.text || '' : ''
    setNowLine(text)
  }

  function setNowLine(text) {
    if (!text) {
      nowLine.textContent = ''
      nowLine.hidden = true
      return
    }
    if (nowLine.textContent === text && !nowLine.hidden) return
    nowLine.textContent = text
    nowLine.hidden = false
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

    const timeMs = (activeAudio.currentTime - getLyricOffset()) * 1000 + lyricState.offsetMs
    const index = findLyricIndex(timeMs)

    if (index !== lastLyricIndex) {
      lastLyricIndex = index
      lastFillPct = -1
      applyActiveLyric(index, false)
    }

    if (index < 0) return
    const line = lyricState.synced[index]
    const span = Math.min(line.endMs - line.timeMs, 8000)
    if (!Number.isFinite(span) || span <= 0) return
    const pct = Math.max(0, Math.min(100, ((timeMs - line.timeMs) / span) * 100))
    if (Math.abs(pct - lastFillPct) < 0.6) return
    lastFillPct = pct
    for (const view of lyricViews) {
      const node = view.nodes[index]
      if (node) node.style.setProperty('--fill', `${pct}%`)
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
      matchedDuration: Number.isFinite(data?.matched?.duration) ? data.matched.duration : null
    }
    if (data?.syncedLyrics) {
      const parsed = parseLRC(data.syncedLyrics)
      lyricState.synced = parsed.lines
      lyricState.offsetMs = -parsed.offsetMs
    }
    renderLyrics()
    updateOffsetUI()
    updateLyricHint()
  }

  async function loadLyricsForSong(song) {
    const token = ++lyricsToken
    lyricsRematched = false

    lyricState = { synced: [], plain: '', offsetMs: 0, instrumental: false, matchedDuration: null }
    clearLyricViews()
    lyricsBadge.hidden = true
    lyricsHint.hidden = true
    updateOffsetUI()

    lyricsTitle.textContent = song?.trackName || 'No song selected'
    lyricsArtist.textContent = song?.artistName || ''

    if (!song || (!song.trackName && !song.artistName)) {
      setLyricsEmptyState('Lyrics appear here while a track plays')
      return
    }

    setLyricsEmptyState('Looking for lyrics')

    try {
      const data = await fetchLyrics(song, lyricDurationFor(song))
      if (token !== lyricsToken) return
      applyLyricsData(data)
    } catch (e) {
      if (token !== lyricsToken) return
      setLyricsEmptyState(e?.status === 404 ? 'No lyrics found for this track' : 'Lyrics are unavailable right now')
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

  lyricsOffsetUp.addEventListener('click', () => setLyricOffset(getLyricOffset() + OFFSET_STEP))
  lyricsOffsetDown.addEventListener('click', () => setLyricOffset(getLyricOffset() - OFFSET_STEP))
  lyricsOffsetValue.addEventListener('click', () => setLyricOffset(0))

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


  function buildListRow(song, opts = {}) {
    const row = document.createElement('div')
    row.className = 'list-item'
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
    title.textContent = song.trackName || 'Unknown'
    const sub = document.createElement('div')
    sub.className = 'list-subtitle'
    sub.textContent = song.artistName || song.collectionName || ''
    meta.appendChild(title)
    meta.appendChild(sub)
    row.appendChild(meta)

    const actions = document.createElement('div')
    actions.className = 'list-actions'

    const addAction = (glyph, label, handler) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'icon-btn'
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
      addAction('play_arrow', 'Play', () => opts.playHandler?.())
      addAction('playlist_play', 'Play next', () => {
        playNext(song)
        showToast('Playing next')
      })
      addAction('add', 'Add to queue', () => {
        addToQueue(song)
        showToast('Added to queue')
      })
      addAction('playlist_add', 'Add to playlist', () => openPlaylistSheet(song))
      addAction(isFavorite(song) ? 'favorite' : 'favorite_border', 'Toggle favorite', () => {
        toggleFavoriteFor(song)
      })
      if (opts.removeHandler) addAction('delete', 'Remove', () => opts.removeHandler())
      if (opts.moveUp) addAction('keyboard_arrow_up', 'Move up', () => opts.moveUp())
      if (opts.moveDown) addAction('keyboard_arrow_down', 'Move down', () => opts.moveDown())
    }

    row.appendChild(actions)

    const ms = Number(song.trackTimeMillis)
    if (Number.isFinite(ms) && ms > 0) {
      const dur = document.createElement('span')
      dur.className = 'list-duration'
      dur.textContent = fmtTime(ms / 1000)
      row.appendChild(dur)
    }

    row.addEventListener('click', () => opts.playHandler?.())
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
    title.textContent = song.trackName || 'Unknown'

    const sub = document.createElement('div')
    sub.className = 'song-card-sub'
    sub.textContent = song.artistName || song.collectionName || ''

    card.appendChild(artWrap)
    card.appendChild(title)
    card.appendChild(sub)
    card.addEventListener('click', playHandler)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        playHandler()
      }
    })
    return card
  }


  function renderQueue() {
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


  function toggleFavoriteFor(song) {
    if (!song) return
    const i = library.favorites.findIndex(s => s.trackId === song.trackId)
    if (i > -1) {
      library.favorites.splice(i, 1)
      showToast('Removed from favorites')
    } else {
      library.favorites.unshift(song)
      showToast('Added to favorites')
    }
    saveLibrary()
    updateFavoriteUI()
    renderFavorites()
    renderQueue()
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


  function createPlaylist(name) {
    if (!name) return null
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16).slice(2)
    library.playlists.push({ id, name, tracks: [] })
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
    if (!library.playlists.length) {
      const empty = document.createElement('div')
      empty.className = 'state-block small'
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined'
      icon.textContent = 'library_music'
      const text = document.createElement('span')
      text.textContent = 'Create your first playlist'
      empty.appendChild(icon)
      empty.appendChild(text)
      playlistsList.appendChild(empty)
      return
    }

    library.playlists.forEach(pl => {
      const row = document.createElement('div')
      row.className = 'list-item'
      row.tabIndex = 0
      if (pl.id === selectedPlaylistId) row.classList.add('is-current')

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
        if (pl.tracks.length) setQueue(pl.tracks, 0)
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
          playlistDetailTracks.innerHTML = ''
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

  function renderPlaylistDetail(id) {
    selectedPlaylistId = id
    const pl = library.playlists.find(p => p.id === id)
    playlistDetailTracks.innerHTML = ''
    if (!pl) {
      playlistDetailTitle.textContent = 'Playlist'
      return
    }
    playlistDetailTitle.textContent = pl.name
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
        playHandler: () => setQueue(pl.tracks, idx),
        removeHandler: () => removeTrackFromPlaylist(pl.id, song.trackId)
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

    const createRow = document.createElement('div')
    createRow.className = 'inline-form'
    const input = document.createElement('input')
    input.type = 'text'
    input.placeholder = 'New playlist name'
    input.setAttribute('aria-label', 'New playlist name')
    const create = document.createElement('button')
    create.type = 'button'
    create.className = 'btn btn-primary'
    const createGlyph = document.createElement('span')
    createGlyph.className = 'material-symbols-outlined'
    createGlyph.textContent = 'add'
    const createText = document.createElement('span')
    createText.className = 'btn-text'
    createText.textContent = 'Create'
    create.appendChild(createGlyph)
    create.appendChild(createText)
    create.addEventListener('click', () => {
      const name = input.value.trim()
      if (!name) return
      const id = createPlaylist(name)
      if (id) addTrackToPlaylist(id, pendingPlaylistTrack)
      closePlaylistSheet()
    })
    createRow.appendChild(input)
    createRow.appendChild(create)
    sheetPlaylists.appendChild(createRow)

    library.playlists.forEach(pl => {
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


  function renderHome() {
    renderHero()
    renderContinue()
    renderMixes()
    renderQuickRadios()
  }

  function renderHero() {
    const featured = currentSong || library.history[0]
    heroArt.innerHTML = ''

    if (!featured) {
      heroEyebrow.textContent = 'Welcome back'
      heroTitle.textContent = 'Find something to play'
      heroSub.textContent = 'Search for a track, start a radio, or pick up where you left off.'
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined'
      icon.textContent = 'graphic_eq'
      heroArt.appendChild(icon)
      return
    }

    heroEyebrow.textContent = currentSong ? 'Now playing' : 'Pick up where you left off'
    heroTitle.textContent = featured.trackName || 'Unknown'
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

  function renderMixes() {
    homeMixGrid.innerHTML = ''
    const seeds = [...library.history.slice(0, 40), ...library.favorites.slice(0, 30)]
    if (!seeds.length) {
      const empty = document.createElement('div')
      empty.className = 'state-block'
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined'
      icon.textContent = 'auto_awesome'
      const text = document.createElement('span')
      text.textContent = 'Listen to a few tracks to generate mixes'
      empty.appendChild(icon)
      empty.appendChild(text)
      homeMixGrid.appendChild(empty)
      return
    }

    const artists = Array.from(new Set(seeds.map(s => s.artistName).filter(Boolean))).slice(0, 4)
    const mixes = artists.map((artist, idx) => ({
      id: `mix-${artist}-${idx}`,
      title: `${artist} Mix`,
      tracks: dedupeTracks(seeds.filter(s => s.artistName === artist))
    })).filter(m => m.tracks.length)

    if (!mixes.length) {
      mixes.push({ id: 'mix-daily', title: 'Daily Mix', tracks: dedupeTracks(seeds).slice(0, 25) })
    }

    mixes.forEach(mix => {
      const card = document.createElement('div')
      card.className = 'mix-card'
      card.style.background = gradientForId(mix.id)
      card.tabIndex = 0

      const title = document.createElement('div')
      title.className = 'mix-title'
      title.textContent = mix.title

      const sub = document.createElement('div')
      sub.className = 'mix-sub'
      sub.textContent = `${mix.tracks.length} ${mix.tracks.length === 1 ? 'track' : 'tracks'}`

      const play = document.createElement('button')
      play.type = 'button'
      play.className = 'mix-play'
      play.setAttribute('aria-label', `Play ${mix.title}`)
      const glyph = document.createElement('span')
      glyph.className = 'material-symbols-outlined'
      glyph.textContent = 'play_arrow'
      play.appendChild(glyph)

      const start = () => setQueue(mix.tracks, 0)
      play.addEventListener('click', (e) => { e.stopPropagation(); start() })
      card.addEventListener('click', start)
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start() }
      })

      card.appendChild(title)
      card.appendChild(sub)
      card.appendChild(play)
      homeMixGrid.appendChild(card)
    })
  }

  function dedupeTracks(list) {
    const seen = new Set()
    const out = []
    for (const item of list) {
      const key = String(item.trackId || `${item.trackName}|${item.artistName}`)
      if (seen.has(key)) continue
      seen.add(key)
      out.push(item)
    }
    return out
  }

  function renderQuickRadios() {
    homeRadioGrid.innerHTML = ''
    const seeds = [
      { label: 'Chill', q: 'chill lofi beats' },
      { label: 'Focus', q: 'focus ambient study music' },
      { label: 'Energy', q: 'upbeat pop hits' },
      { label: 'Classics', q: 'classic rock hits' },
      { label: 'Jazz', q: 'smooth jazz playlist' }
    ]
    if (library.history[0]?.artistName) {
      seeds.unshift({ label: `${library.history[0].artistName} radio`, q: `${library.history[0].artistName} songs` })
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


  function filterResults(items) {
    if (activeFilter === 'youtube') return items.filter(s => s.source === 'youtube')
    if (activeFilter === 'itunes') return items.filter(s => s.source !== 'youtube')
    return items
  }

  function renderSearch() {
    searchResults.innerHTML = ''
    const items = filterResults(lastResults)
    searchEmpty.hidden = items.length > 0 || lastResults.length > 0 ? true : false

    if (!items.length && lastResults.length) {
      const empty = document.createElement('div')
      empty.className = 'state-block'
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined'
      icon.textContent = 'filter_alt_off'
      const text = document.createElement('span')
      text.textContent = 'No results for this filter'
      empty.appendChild(icon)
      empty.appendChild(text)
      searchResults.appendChild(empty)
      return
    }

    items.forEach((song, idx) => {
      searchResults.appendChild(buildListRow(song, {
        playHandler: () => setQueue(items, idx)
      }))
    })
  }

  function searchSongs() {
    const q = searchInput.value.trim()
    if (!q) return
    showTab('search')
    searchLoading.hidden = false
    searchEmpty.hidden = true
    searchResults.innerHTML = ''
    fetch(`/music/meta?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => {
        lastResults = Array.isArray(d.results) ? d.results : []
        renderSearch()
        if (!lastResults.length) {
          searchEmpty.hidden = false
          const label = searchEmpty.querySelector('span:last-child')
          if (label) label.textContent = 'No results found'
        }
      })
      .catch(() => {
        lastResults = []
        searchResults.innerHTML = ''
        searchEmpty.hidden = false
        const label = searchEmpty.querySelector('span:last-child')
        if (label) label.textContent = 'Search failed, try again'
      })
      .finally(() => {
        searchLoading.hidden = true
      })
  }

  searchFilters.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip[data-filter]')
    if (!btn) return
    activeFilter = btn.dataset.filter
    searchFilters.querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c === btn))
    renderSearch()
  })

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchSongs()
  })

  searchInput.addEventListener('input', () => {
    searchClear.hidden = !searchInput.value
  })

  searchClear.addEventListener('click', () => {
    searchInput.value = ''
    searchClear.hidden = true
    searchInput.focus()
  })

  searchBtn.addEventListener('click', searchSongs)


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
      queueIndex = queue.length - 1
    } else {
      queueIndex = queue.findIndex(s => s.trackId === song.trackId)
    }

    setStatus('Loading')
    crossfadeArmed = false
    activeAudio.pause()
    activeAudio.removeAttribute('src')
    activeAudio.load()
    currentSong = song
    applySongUI(song)
    renderQueue()
    syncPlayUI()

    try {
      await prepareAudio(activeAudio, song, true)
      setStatus('')
      syncPlayUI()
      preloadNextTrack()
    } catch {
      setStatus('Unable to play this track')
      showToast('Unable to play this track')
      activeAudio.pause()
      activeAudio.removeAttribute('src')
      activeAudio.load()
      syncPlayUI()
    }
  }

  function applySongUI(song) {
    const title = song.trackName || 'Unknown'
    const artist = song.artistName || song.collectionName || ''
    songTitle.textContent = title
    artistName.textContent = artist
    nowTitle.textContent = title
    nowArtist.textContent = artist
    setArtwork(artFor(song, true))
    updateFavoriteUI()
    renderUpNext()
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

  nowTitle.addEventListener('click', () => showTab('player'))
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

  createPlaylistBtn.addEventListener('click', () => {
    const name = newPlaylistName.value.trim()
    if (!name) return
    const id = createPlaylist(name)
    newPlaylistName.value = ''
    if (id) renderPlaylistDetail(id)
  })

  newPlaylistName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') createPlaylistBtn.click()
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
    if (e.target !== activeAudio) return
    syncPlayUI()
    renderHero()
  }

  function handleEnded(e) {
    if (e.target !== activeAudio) return
    syncPlayUI()
    crossfadeArmed = false
    const nextIdx = getNextIndex()
    const expected = nextIdx === -1 ? null : queue[nextIdx]
    if (expected && preloadAudio.dataset.trackId === String(expected.trackId || '') && preloadAudio.readyState >= 2) {
      swapPlayers()
      currentSong = expected
      queueIndex = nextIdx
      applySongUI(currentSong)
      renderQueue()
      activeAudio.play().catch(() => {})
      preloadNextTrack()
      return
    }
    nextSong()
  }

  function handleTime(e) {
    if (e.target !== activeAudio) return
    if (isScrubbing) return
    syncProgressUI()
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
    el.addEventListener('seeked', resetLyricTracking)
  }

  attachAudioListeners(audioA)
  attachAudioListeners(audioB)


  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName
    const typing = tag === 'INPUT' || tag === 'TEXTAREA'

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


  volumeSlider.value = Math.round((library.settings.volume ?? 0.7) * 100)
  activeAudio.volume = library.settings.volume ?? 0.7
  preloadAudio.volume = activeAudio.volume

  applyRailState()
  syncThemeUI()
  applyLyricSize()
  lyricsSyncToggle.classList.toggle('is-active', library.settings.syncedLyrics)
  lyricsSyncToggle.setAttribute('aria-pressed', String(library.settings.syncedLyrics))

  updateMuteGlyph()
  updateVolumeSliderTrack()
  updateFavoriteUI()
  setArtwork('')
  setStatus('')
  setProgressPct(0)
  renderFavorites()
  renderPlaylists()
  renderHome()
  renderQueue()
  syncPlayUI()
  loadLyricsForSong(null)
  tickLyrics()

  window.setTimeout(syncThemeUI, 400)
})
