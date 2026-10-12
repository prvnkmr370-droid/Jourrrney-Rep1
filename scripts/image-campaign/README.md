# Destination photo campaign (Wikimedia Commons)

Goal: at least 5 verified, correctly-identified, freely-licensed photos on every
destination card (`gallery`), with credits kept on the in-app Photo credits
screen instead of on the cards.

## Rules (do not relax)
- Only freely reusable licences: CC0, public domain, CC BY, CC BY-SA. Never scrape
  Adobe Stock or any paid stock site (watermarked previews, no licence).
- Every photo must be LOOKED AT and match the destination. Place-name look-alikes
  (Long Island = Bahamas, Ross Island = Antarctica, Chandragiri = Kerala) are the
  main failure; geotags outside India or >150 km away are dropped automatically.
- Never pad: a card with 3 real photos stays at 3. Report it instead.
- Hero/image fields and all other card data are never touched; photos are appended
  to `gallery` (cap 12).

## Pipeline
1. `python3 scripts/image-campaign/plan-jobs.py <jobdir> [--skip "State" ...]`
   chunks the cards that have < 5 gallery photos and writes `<jobdir>/manifest.json`.
2. `CAND_MAX=20 node scripts/image-campaign/run-search-pool.mjs <jobdir> 5`
   runs `scripts/find-commons-images.mjs` per chunk (resumable).
3. Split candidates into groups of ~5 cards (first 10 candidates per card for the
   first pass) and have an agent view every candidate preview and write
   `<group>_verified.json` (see the prompt used in the Andaman/Andhra runs).
4. `python3 scripts/image-campaign/merge-and-review.py <state> <merged.json> <review.html> <cards.json> <verified.json>...`
   builds the merged file and the HTML review page.
5. `node scripts/apply-verified-images.mjs <merged.json>...` HEAD-checks every URL,
   appends to `gallery`, records credits (scripts/data/photo-credits.json ->
   src/data/photoCredits.ts). Then normalise `thumb.wikimedia.org` -> `upload.wikimedia.org`,
   typecheck, publish an OTA update.

## Gotchas
- Wikimedia answers 429 when hammered; downloads retry with back-off.
- Wikimedia only serves thumbnails at standard widths (use 1280px for galleries,
  500px for previews).
- Editing package.json/app.json native fields changes the update runtime version.
