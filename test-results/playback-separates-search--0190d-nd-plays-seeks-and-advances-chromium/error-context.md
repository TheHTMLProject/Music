# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: playback.spec.js >> separates search results and plays, seeks, and advances
- Location: test\browser\playback.spec.js:3:1

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0.5
Received:   0

Call Log:
- Timeout 60000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - complementary "Primary" [ref=e3]:
    - generic [ref=e4]:
      - button "Expand navigation" [ref=e5] [cursor=pointer]:
        - generic [ref=e6]: menu
      - generic "Music activity" [ref=e7]:
        - generic [ref=e9]: graphic_eq
        - generic [ref=e11]: Music
    - navigation [ref=e12]:
      - button "home Home" [ref=e13] [cursor=pointer]:
        - generic [ref=e14]: home
        - generic [ref=e16]: Home
      - button "search Search" [ref=e17] [cursor=pointer]:
        - generic [ref=e18]: search
        - generic [ref=e20]: Search
      - button "album Now Playing" [ref=e21] [cursor=pointer]:
        - generic [ref=e22]: album
        - generic [ref=e24]: Now Playing
      - button "lyrics Lyrics" [ref=e25] [cursor=pointer]:
        - generic [ref=e26]: lyrics
        - generic [ref=e28]: Lyrics
      - button "queue_music Queue" [ref=e29] [cursor=pointer]:
        - generic [ref=e30]: queue_music
        - generic [ref=e32]: Queue
      - button "library_music Playlists" [ref=e33] [cursor=pointer]:
        - generic [ref=e34]: library_music
        - generic [ref=e36]: Playlists
      - button "favorite Favorites" [ref=e37] [cursor=pointer]:
        - generic [ref=e38]: favorite
        - generic [ref=e40]: Favorites
    - generic "Music beta" [ref=e41]:
      - generic [aria-hidden] [ref=e42]: experiment
    - link "Report an issue" [ref=e43] [cursor=pointer]:
      - /url: https://github.com/TheHTMLProject/Music/issues
      - generic [aria-hidden] [ref=e44]: bug_report
  - generic [ref=e45]:
    - banner [ref=e46]:
      - generic [ref=e47]:
        - heading "Search" [level=1] [ref=e48]
        - paragraph [ref=e49]: Find songs across the catalog and YouTube
      - search [ref=e50]:
        - generic [ref=e51]: search
        - textbox "Search music" [ref=e52]:
          - /placeholder: Search songs, artists, albums
          - text: Acid Jazz Kevin MacLeod
        - button "Clear search" [ref=e53] [cursor=pointer]:
          - generic [ref=e54]: close
        - button "Search" [ref=e55] [cursor=pointer]:
          - generic [ref=e56]: arrow_forward
    - main [ref=e57]:
      - region "Search" [ref=e58]:
        - generic [ref=e59]:
          - generic [ref=e61]:
            - button "music_note Songs" [ref=e62] [cursor=pointer]:
              - generic [ref=e63]: music_note
              - generic [ref=e64]: Songs
            - button "person Artists" [ref=e65] [cursor=pointer]:
              - generic [ref=e66]: person
              - generic [ref=e67]: Artists
            - button "featured_play_list Playlists" [ref=e68] [cursor=pointer]:
              - generic [ref=e69]: featured_play_list
              - generic [ref=e70]: Playlists
          - generic "Search results" [ref=e71]:
            - region "Suggested songs" [ref=e72]:
              - heading "Suggested songs" [level=2] [ref=e73]
              - paragraph [ref=e74]: Catalog matches and uploads tied to the requested artist
              - generic [ref=e75] [cursor=pointer]:
                - generic [ref=e76]:
                  - generic [ref=e77]: Acid Trumpet
                  - generic [ref=e79]: Kevin MacLeod
                - generic [ref=e80]:
                  - button "Add to queue" [ref=e81]:
                    - generic [ref=e82]: add
                  - button "Toggle favorite" [ref=e83]:
                    - generic [ref=e84]: favorite_border
                  - button "More actions" [ref=e85]:
                    - generic [ref=e86]: more_vert
                - generic [ref=e87]: 3:28
              - generic [active] [ref=e88] [cursor=pointer]:
                - generic [ref=e89]:
                  - generic [ref=e90]: Acid Jazz
                  - generic [ref=e92]: Kevin MacLeod
                - generic [ref=e93]:
                  - button "Add to queue" [ref=e94]:
                    - generic [ref=e95]: add
                  - button "Toggle favorite" [ref=e96]:
                    - generic [ref=e97]: favorite_border
                  - button "More actions" [ref=e98]:
                    - generic [ref=e99]: more_vert
                - generic [ref=e100]: 3:29
              - generic [ref=e101] [cursor=pointer]:
                - generic [ref=e102]:
                  - generic [ref=e103]: "Kevin MacLeod: Acid Trumpet"
                  - generic [ref=e105]: Kevin MacLeod Archive
                - generic [ref=e106]:
                  - button "Add to queue" [ref=e107]:
                    - generic [ref=e108]: add
                  - button "Toggle favorite" [ref=e109]:
                    - generic [ref=e110]: favorite_border
                  - button "More actions" [ref=e111]:
                    - generic [ref=e112]: more_vert
                - generic [ref=e113]: 3:31
            - region "Community uploads" [ref=e114]:
              - heading "Community uploads" [level=2] [ref=e115]
              - paragraph [ref=e116]: Reposts, covers, remixes, and uploads from other channels
              - generic [ref=e117] [cursor=pointer]:
                - generic [ref=e118]:
                  - generic [ref=e119]: Acid Jazz - Kevin MacLeod
                  - generic [ref=e121]: Audio Library - Free Music
                - generic [ref=e122]:
                  - button "Add to queue" [ref=e123]:
                    - generic [ref=e124]: add
                  - button "Toggle favorite" [ref=e125]:
                    - generic [ref=e126]: favorite_border
                  - button "More actions" [ref=e127]:
                    - generic [ref=e128]: more_vert
                - generic [ref=e129]: 3:29
              - generic [ref=e130] [cursor=pointer]:
                - generic [ref=e131]:
                  - generic [ref=e132]: Kevin MacLeod - AcidJazz
                  - generic [ref=e134]: Free Music Channel
                - generic [ref=e135]:
                  - button "Add to queue" [ref=e136]:
                    - generic [ref=e137]: add
                  - button "Toggle favorite" [ref=e138]:
                    - generic [ref=e139]: favorite_border
                  - button "More actions" [ref=e140]:
                    - generic [ref=e141]: more_vert
                - generic [ref=e142]: 3:33
              - generic [ref=e143] [cursor=pointer]:
                - generic [ref=e144]:
                  - generic [ref=e145]: "Kevin MacLeod ♪ Acid Jazz #JazzBluesFunky"
                  - generic [ref=e147]: Youtube Audio library
                - generic [ref=e148]:
                  - button "Add to queue" [ref=e149]:
                    - generic [ref=e150]: add
                  - button "Toggle favorite" [ref=e151]:
                    - generic [ref=e152]: favorite_border
                  - button "More actions" [ref=e153]:
                    - generic [ref=e154]: more_vert
                - generic [ref=e155]: 3:32
              - generic [ref=e156] [cursor=pointer]:
                - generic [ref=e157]:
                  - generic [ref=e158]: Kevin MacLeod - Acid Jazz [Jazz & Blues]
                  - generic [ref=e160]: 1HMNC - No Copyright Music
                - generic [ref=e161]:
                  - button "Add to queue" [ref=e162]:
                    - generic [ref=e163]: add
                  - button "Toggle favorite" [ref=e164]:
                    - generic [ref=e165]: favorite_border
                  - button "More actions" [ref=e166]:
                    - generic [ref=e167]: more_vert
                - generic [ref=e168]: 3:29
              - generic [ref=e169] [cursor=pointer]:
                - generic [ref=e170]:
                  - generic [ref=e171]: Acid Jazz by Kevin MacLeod
                  - generic [ref=e173]: LIMO Recording Studio
                - generic [ref=e174]:
                  - button "Add to queue" [ref=e175]:
                    - generic [ref=e176]: add
                  - button "Toggle favorite" [ref=e177]:
                    - generic [ref=e178]: favorite_border
                  - button "More actions" [ref=e179]:
                    - generic [ref=e180]: more_vert
                - generic [ref=e181]: 3:29
              - generic [ref=e182] [cursor=pointer]:
                - generic [ref=e183]:
                  - generic [ref=e184]: Kevin McLeod - AcidJazz
                  - generic [ref=e186]: Prinz Va
                - generic [ref=e187]:
                  - button "Add to queue" [ref=e188]:
                    - generic [ref=e189]: add
                  - button "Toggle favorite" [ref=e190]:
                    - generic [ref=e191]: favorite_border
                  - button "More actions" [ref=e192]:
                    - generic [ref=e193]: more_vert
                - generic [ref=e194]: 3:30
              - generic [ref=e195] [cursor=pointer]:
                - generic [ref=e196]:
                  - generic [ref=e197]: Kevin MacLeod - AcidJazz
                  - generic [ref=e199]: Manuel Campillo
                - generic [ref=e200]:
                  - button "Add to queue" [ref=e201]:
                    - generic [ref=e202]: add
                  - button "Toggle favorite" [ref=e203]:
                    - generic [ref=e204]: favorite_border
                  - button "More actions" [ref=e205]:
                    - generic [ref=e206]: more_vert
                - generic [ref=e207]: 3:29
              - generic [ref=e208] [cursor=pointer]:
                - generic [ref=e209]:
                  - generic [ref=e210]: Acid Jazz | Kevin MacLeod
                  - generic [ref=e212]: Sound Effects Square
                - generic [ref=e213]:
                  - button "Add to queue" [ref=e214]:
                    - generic [ref=e215]: add
                  - button "Toggle favorite" [ref=e216]:
                    - generic [ref=e217]: favorite_border
                  - button "More actions" [ref=e218]:
                    - generic [ref=e219]: more_vert
                - generic [ref=e220]: 3:29
              - generic [ref=e221] [cursor=pointer]:
                - generic [ref=e222]:
                  - generic [ref=e223]: 🎵 Acid Jazz - Kevin MacLeod 🎧 No Copyright Music 🎶 YouTube Audio Library
                  - generic [ref=e225]: Music Lover – No Copyright Music
                - generic [ref=e226]:
                  - button "Add to queue" [ref=e227]:
                    - generic [ref=e228]: add
                  - button "Toggle favorite" [ref=e229]:
                    - generic [ref=e230]: favorite_border
                  - button "More actions" [ref=e231]:
                    - generic [ref=e232]: more_vert
                - generic [ref=e233]: 3:29
              - generic [ref=e234] [cursor=pointer]:
                - generic [ref=e235]:
                  - generic [ref=e236]: Acid Jazz - Kevin MacLeod
                  - generic [ref=e238]: clock mooosic
                - generic [ref=e239]:
                  - button "Add to queue" [ref=e240]:
                    - generic [ref=e241]: add
                  - button "Toggle favorite" [ref=e242]:
                    - generic [ref=e243]: favorite_border
                  - button "More actions" [ref=e244]:
                    - generic [ref=e245]: more_vert
                - generic [ref=e246]: 3:34
              - generic [ref=e247] [cursor=pointer]:
                - generic [ref=e248]:
                  - generic [ref=e249]: Acid Jazz - Kevin MacLeod T D M
                  - generic [ref=e251]: The dreamy musician
                - generic [ref=e252]:
                  - button "Add to queue" [ref=e253]:
                    - generic [ref=e254]: add
                  - button "Toggle favorite" [ref=e255]:
                    - generic [ref=e256]: favorite_border
                  - button "More actions" [ref=e257]:
                    - generic [ref=e258]: more_vert
                - generic [ref=e259]: 3:31
  - contentinfo "Player" [ref=e260]:
    - generic [ref=e261]:
      - generic [ref=e263]:
        - button "Acid Jazz" [ref=e264] [cursor=pointer]
        - generic [ref=e266]: Kevin MacLeod
      - button "Add to favorites" [ref=e267] [cursor=pointer]:
        - generic [ref=e268]: favorite
    - generic [ref=e269]:
      - generic [ref=e270]:
        - button "Shuffle" [ref=e271] [cursor=pointer]:
          - generic [ref=e272]: shuffle
        - button "Previous track" [ref=e273] [cursor=pointer]:
          - generic [ref=e274]: skip_previous
        - button "Play" [ref=e275] [cursor=pointer]:
          - generic [ref=e276]: play_arrow
        - button "Next track" [ref=e277] [cursor=pointer]:
          - generic [ref=e278]: skip_next
        - button "Repeat" [ref=e279] [cursor=pointer]:
          - generic [ref=e280]: repeat
      - generic [ref=e281]:
        - generic [ref=e282]: 0:00
        - slider "Seek" [ref=e283] [cursor=pointer]
        - generic [ref=e285]: 0:00
    - generic [ref=e286]:
      - button "Open lyrics" [ref=e287] [cursor=pointer]:
        - generic [ref=e288]: lyrics
      - button "Open queue" [ref=e289] [cursor=pointer]:
        - generic [ref=e290]: queue_music
      - generic [ref=e291]:
        - button "Mute" [ref=e292] [cursor=pointer]:
          - generic [ref=e293]: volume_up
        - generic:
          - slider "Volume": "100"
      - button "Expand to now playing" [ref=e294] [cursor=pointer]:
        - generic [ref=e295]: keyboard_arrow_up
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('separates search results and plays, seeks, and advances', async ({ page }) => {
  4  |   const errors = [];
  5  |   page.on('pageerror', error => errors.push(error.message));
  6  |   page.on('response', response => {
  7  |     if (/\/music\/(?:search|direct-audio)/.test(response.url())) console.log(response.status(), response.url());
  8  |   });
  9  |   await page.goto('/');
  10 |   await page.locator('#searchInput').fill('Acid Jazz Kevin MacLeod');
  11 |   await page.locator('#searchBtn').click();
  12 | 
  13 |   const suggested = page.getByRole('region', { name: 'Suggested songs' });
  14 |   const community = page.getByRole('region', { name: 'Community uploads' });
  15 |   await expect(suggested).toBeVisible();
  16 |   await expect(community).toBeVisible();
  17 |   await expect(suggested).toContainText('Acid Jazz');
  18 |   await expect(suggested).toContainText('Kevin MacLeod');
  19 | 
  20 |   const first = suggested.locator('.list-item').filter({ hasText: 'Acid Jazz' }).first();
  21 |   await first.click();
  22 |   await expect(page.locator('#nowTitle')).toContainText('Acid Jazz');
  23 |   try {
> 24 |     await expect.poll(async () => page.locator('#audioPrimary, #audioSecondary').evaluateAll(elements => Math.max(...elements.map(element => element.currentTime || 0))), { timeout: 60000 }).toBeGreaterThan(0.5);
     |                                                                                                                                                                                               ^ Error: expect(received).toBeGreaterThan(expected)
  25 |   } catch (error) {
  26 |     console.log(await page.locator('#audioPrimary, #audioSecondary').evaluateAll(elements => elements.map(element => ({
  27 |       src: element.currentSrc,
  28 |       paused: element.paused,
  29 |       error: element.error && { code: element.error.code, message: element.error.message },
  30 |       networkState: element.networkState,
  31 |       readyState: element.readyState,
  32 |       duration: element.duration,
  33 |       time: element.currentTime
  34 |     }))));
  35 |     throw error;
  36 |   }
  37 | 
  38 |   await page.locator('.rail-item[data-tab="search"]').click();
  39 |   const second = suggested.locator('.list-item').nth(1);
  40 |   await second.getByRole('button', { name: 'Add to queue' }).click();
  41 |   await page.locator('.rail-item[data-tab="player"]').click();
  42 | 
  43 |   const before = await page.locator('#nowTitle').textContent();
  44 |   await page.locator('#audioPrimary, #audioSecondary').evaluateAll(elements => {
  45 |     const active = elements.find(element => !element.paused);
  46 |     if (!active || !Number.isFinite(active.duration)) throw new Error('No active seekable audio element');
  47 |     active.currentTime = Math.max(0, active.duration - 0.6);
  48 |   });
  49 |   await expect.poll(async () => page.locator('#nowTitle').textContent(), { timeout: 60000 }).not.toBe(before);
  50 |   await expect(page.locator('#progressBar')).toHaveAttribute('aria-valuetext', / of /);
  51 |   expect(errors).toEqual([]);
  52 | });
  53 | 
```