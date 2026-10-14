# Jourrrney screens as SVG (for Figma)

Vector exports of the current build, one file per screen or state. They are
named with the same **Screen ID** used in `journey-screens-figma.csv` (repo
root), so each row of that sheet points at its picture.

- `index.csv` lists every Screen ID (all 100) and which file shows it.
- `Sxxx-name.svg` is the screen at **390 x 844** (a phone-sized frame).
- `Sxxx-name--full.svg` is the same screen **unrolled to its full scrolling
  length** (capped at 3,200 px). Only scrolling screens have one.

## Importing into Figma

Drag the `.svg` files onto the canvas. Each becomes a frame of real vector
layers: rectangles, paths and **editable text**, with photos embedded as
images. Rounded corners, borders, gradients and drop shadows are kept.

Text is set in **Poppins** (400 / 500 / 600 / 700 / 800), which Figma ships
with, so it should resolve with no font install.

## How these were made

Rendered from the Expo web build of the app at a 390 px wide phone viewport,
then converted from the live DOM to SVG primitives. Please treat them as a
faithful *reference of the layout and copy*, not a pixel-exact native capture:

- No phone status bar or notch / home-indicator safe areas (web build).
- Background blur ("glass" cards) is drawn as flat translucent fills.
- Scrolled carousels show only the slide that was on screen.
- Photos come from the app's own destination data, downscaled to 560 px wide.

## Data on the screens is not live

The backend was answered locally while capturing, so nothing left the machine:

- Sign-in error states and the confirm-code step use canned replies
  (`you@example.com` is a sample address).
- Plan Trip results show the app's built-in template plan. The two screens
  marked "AI" in `index.csv` (S055, S056) use a local mock AI itinerary built
  from the destination's own curated text.
- Signed-in screens show the app's placeholder persona and hard-coded stats
  (the same demo data the code ships with).

## What is not here

`index.csv` marks 8 rows "Not captured": native alert dialogs (S007, S081),
the OS photo picker and soft keyboard (S047, S048), the PDF / share sheet
(S060), the dormant "Traveler Hurdles" section (S035) and the unused location
picker (S099, S100).

18 rows are "Shown inside another frame" (for example the tab bar, card
variants and default tabs); the index says which file contains them.
