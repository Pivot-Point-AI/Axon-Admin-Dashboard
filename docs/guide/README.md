# Building the user guide

Screenshots are captured from a running dashboard, so every figure shows live data.

```bash
# 1. In the repo root, start the app:  npm run dev
# 2. In docs/guide, with an account that can sign in (read-only is enough):
npm i --no-save playwright-core          # once; or set PLAYWRIGHT_CORE to an existing copy
set AXON_USER=you@example.com & set AXON_PASS=********   # PowerShell: $env:AXON_USER="..."
node capture-live.cjs        # logs in, waits for data on every page, saves shots/*.png
python prepare_images.py     # compresses + numbers the main screens  (needs Pillow)
python build.py              # builds Axon-Admin-Dashboard-User-Guide.pdf (needs pypdfium2)
```

Set `CHROME_PATH` if Playwright cannot find a browser. Edit `guide.template.html` to change wording.
