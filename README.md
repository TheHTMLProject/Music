# The HTML Project Music

The HTML Project Music is a self-hosted music player powered by YouTube, Invidious, and optional Gemini features.

## Docker installation

Docker is the simplest way to run the app.

1. Clone the repository.

```bash
git clone https://github.com/TheHTMLProject/Music.git
cd Music
```

2. Build the image.

```bash
docker build -t thp-music .
```

3. Start the container. Each `--env` flag sets one app option directly from the command. Change the values as needed.

```bash
docker run -d \
  --name thp-music \
  --restart unless-stopped \
  --publish 8080:8080 \
  --env PORT=8080 \
  --env GEMINI_API_KEY="your-api-key" \
  --env GEMINI_MODEL="gemini-3.5-flash-lite" \
  --env INVIDIOUS_URL="https://your-invidious-instance.example" \
  thp-music
```

Open `http://localhost:8080`.

The same command on one line is:

```bash
docker run -d --name thp-music --restart unless-stopped --publish 8080:8080 --env PORT=8080 --env GEMINI_API_KEY="your-api-key" --env GEMINI_MODEL="gemini-3.5-flash-lite" --env INVIDIOUS_URL="https://your-invidious-instance.example" thp-music
```

Use `--env NAME="value"` for each setting you want to customize. Every `--env` flag is optional. `PORT` defaults to `3333`. Gemini features are disabled when `GEMINI_API_KEY` is empty. The app uses YouTube directly when `INVIDIOUS_URL` is empty.

If you change `PORT`, both numbers in `--publish HOST_PORT:CONTAINER_PORT` do not need to match. The container port must match `PORT`. For example, `--publish 9000:8080 --env PORT=8080` opens the app at `http://localhost:9000`.

You can also keep settings in a local `.env` file.

```bash
cp .env.example .env
docker run -d --name thp-music --restart unless-stopped --env-file .env -p 3333:3333 thp-music
```

Useful container commands:

```bash
docker logs -f thp-music
docker stop thp-music
docker rm thp-music
```

## Regular installation

Requirements:

- Node.js 22 or newer
- npm
- FFmpeg
- Python 3

1. Clone the repository and install dependencies.

```bash
git clone https://github.com/TheHTMLProject/Music.git
cd Music
npm ci
```

2. Create `.env` from `.env.example` and edit the values you want.

```bash
cp .env.example .env
```

PowerShell users can run:

```powershell
Copy-Item .env.example .env
```

3. Start the app.

```bash
npm start
```

Open `http://localhost:3333`, or use the port set in `.env`.

## Environment settings

| Setting | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3333` | Port used by the web server |
| `GEMINI_API_KEY` | Empty | Enables AI mixes, radio assistance, and lyric translation |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` | Gemini model used by AI features |
| `INVIDIOUS_URL` | Empty | Optional Invidious instance used as a playback fallback |

Do not commit your `.env` file or API keys.

## License

See [LICENSE](LICENSE).
