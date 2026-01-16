# Kunterbunt Juggling Convention

Static landing page for the Kunterbunt Juggling Convention.

## Run locally

1. Move into the project directory:
   ```bash
   cd /workspace/websiteProject
   ```
2. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open the site in your browser:
   ```
   http://localhost:8000
   ```

## Troubleshooting

- **"localhost refused to connect"** usually means the server is not running. Make sure the `python3 -m http.server 8000` command is still running in your terminal.
- If port 8000 is busy, try another port:
  ```bash
  python3 -m http.server 8080
  ```
  Then open `http://localhost:8080`.
- If you see a directory listing instead of the page, verify you're running the server from the folder that contains `index.html`.
