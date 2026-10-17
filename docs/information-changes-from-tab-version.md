# What changed from the tab version: information to consider bringing back

**Compared:** the last saved tabbed version of the destination page (commit `bdef231`, with the six tabs About, Day plan, Stay, How to reach, Budget, Safety) against what is on your phone now (update `35aa8b0b`, published 17 Oct 2026).

**How I checked:** I compared every piece of data and every label the old screens showed with the new screens, line by line in the code, and I counted how many of the 1,952 places each difference affects. Counts below are real, not estimates.

**Update (same day, after your changes):** A1 is now handled as a months-only one-liner. The Time needed card, the Save and Share buttons beside Directions, and the "Back" word were removed at your request (see section G). Nothing below has been published to your phone yet beyond the update noted above, unless it says so.

**The short answer:** almost nothing was deleted. Two things are genuinely **no longer visible**, a handful are **hidden until you tap**, and the rest is **renamed or moved**. Tick the "Bring back?" box on anything you want and tell me.

---

## A. No longer visible anywhere on the destination page

### A1. The full "best time to visit" sentence
- **Before:** the photo header showed the place's full best-season text, for example *"November – April (June – August brings heavy rain)"*.
- **Now:** the "Best time" card shows a short version, *"Nov – Apr"*. The full text appears only for a screen reader and in the Trip Prep screens ("What to pack for …").
- **Places affected:** **674** of 1,952 lose text (595 had a bracketed caveat, 282 had a "; …" second part). Another 1,250 were only abbreviated ("October – May" became "Oct – May"), which loses nothing. 28 are shown in full.
- **Real examples of what disappeared:**
  - Bhaderwah: *"…December – February for snow; avoid July – August (landslide and cloudburst risk)"* now reads only *Apr – Jun and Sep – Nov*.
  - Delhi: *"February – March, then late October – mid-November if the air is acceptable (…air quality is poor from October to December)"* now reads only *Feb – Mar*, so the second visiting window is gone.
  - Nagapattinam: the cyclone warning is gone.
- **DECIDED (your call, after trying the full text):** the note under the status is a one-line "Best time to visit: Sep – Apr" with **months only**. A second visiting window is kept ("Feb – Mar and late Oct – mid-Nov", 91 places have more than one window). The reasons and warnings in the place's sentence are **left out on purpose**: for example "avoid July – August (landslide risk)", "the north-east monsoon runs August – December, with cyclone risk", "(winter for migratory birds)". 674 places have such a caveat or second part in their text.
- **Where the full sentence still is:** in the place data (nothing was deleted), and in the Trip Prep screens ("What to pack for …"). If you ever want a caveat back, the cleanest place is a "Good to know" line on What to know before I go (Safety notices already carries season warnings such as "Waterlogging on roads is common after heavy spells").
- **Fits on one line:** 1,948 of 1,952 places; 4 places with two long windows wrap to two lines.
- ☑ **Handled**

### A2. The colour-coded safety score on the photo
- **Before:** a pill at the top right of the photo, *"Safety 8.5/10"*, in green, amber or red depending on the score, visible the moment the page opened.
- **Now:** the score appears only as plain text in the fourth row, *"Women's safety 8.5 / 10 · Very Safe"*, with no colour coding.
- **Places affected:** all 1,952. Scores run from 4 to 9. **33** places score below 6 and **343** below 7, so for those the warning colour used to show immediately.
- **Suggested fix:** put the colour-coded pill back on the photo, or colour the safety row to match (words plus colour, never colour alone).
- ☐ **Bring back?**

---

## B. Still there, but hidden until you tap (or harder to find)

### B1. The "Stay:" line under each day in the day plan
- **Before:** each day's header showed its title and, under it, *"Stay: Hotel in Sector 17 or Sector 35"* without opening anything.
- **Now:** the stay line is inside the day and only shows after you open it.
- **Affects:** 2,205 days across all places.
- ☐ **Bring back?** (show the stay line in the closed header)

### B2. Days 2 and later of longer plans
- **Before:** every day of a multi-day plan was listed on the Day plan tab, Day 1 already open.
- **Now:** only Day 1 shows; the rest are behind "Show all N days".
- **Affects:** 224 places, 253 extra days. Nothing is removed.
- ☐ **Bring back?** (show all days by default)

### B3. Stay details are closed by default for places with more than one stay level
- **Before:** the Stay tab showed every level's description, example places and source note at once.
- **Now:** you see the level names and prices, and tap one to read its description, examples and source note. Places with a single stay entry open by themselves.
- **Affects:** 611 places with 2 or 3 stay levels. 20 source notes (for example the government-tourism-site notes on the Andaman places) are now closed by default.
- ☐ **Bring back?** (open all levels by default, or at least show the source note)

### B4. Daily budget ("What a day costs") is much harder to find
- **Before:** Budget was its own tab, one tap away from anywhere on the page.
- **Now:** it is the last section at the bottom of "Where to stay", just under the price list and the map button (you may need a small scroll to see it). Nothing on the home page mentions it, and the "Where to stay" row only talks about hotel prices, so someone who never opens that page never sees the daily cost.
- **Affects:** all 1,952 places (all have a budget breakdown).
- ☐ **Bring back?** (add a row on the home page, or move it higher)

### B5. Switching between sections is no longer one tap
- **Before:** a tab strip stayed pinned at the top, so from anywhere you could tap Safety, Stay, Budget and so on.
- **Now:** each section is its own page. To go from one to another you press Back, then tap the next row. The pinned bar only shows Back and the place name.
- ☐ **Bring back?** (for example "More about this place" shortcuts at the bottom of each page)

---

## C. Changed on purpose (renamed, reworded, or removed as filler)

| # | What | Before | Now |
|---|---|---|---|
| C1 | A filler stay example | "Recommended: Check accommodation at the nearest major town/city" | Hidden, because it is not a place. Affects **129** stay entries (each place with it had nothing else listed). |
| C2 | The "Customise with AI" button at the top of the Day plan tab | Always visible | "Plan my own with AI" inside an opened day, plus the bottom bar on every screen. |
| C3 | Section names | Overview, Itinerary, Getting There, City Essentials, Travel Advisory, Safety | About, "A day at …", From my city, City tips, Safety notices, Is it safe? |
| C4 | Small labels | "Pro Tip", "Recommended:" (names without map links) | "Tip", "Examples" |
| C5 | The Stay page intro | "Accommodation options across all budgets in Rock Garden." | "Near Rock Garden. Prices are a guide for one room a night." |
| C6 | Price wording | "₹1,000–₹2,500/night (estimate)" | "₹1,000 – ₹2,500 a night" with an "Estimate" label. **Nothing dropped:** I checked all 2,996 stay entries. |

---

## D. Side effect of removing the tabs

- **Text that points to a tab that no longer exists.** About **5,800 lines** in the place guides (1,941 of 1,952 places) say things like *"see the 'Getting There' tab above for a distance and cost estimate"*. There is no Getting There tab any more. These lines show on the "How to get there" page.
- **Suggested fix:** reword them to "enter your city above". It is a text clean-up in the guide data.
- ☐ **Fix?**

---

## E. Checked and NOT lost

- The description, Top highlights, and all Places Near (popular, hidden gems, more nearby). (The Opening hours card was removed later at your request, see section H; Top highlights now sit under "Read more", see section I.)
- All stay levels, prices, descriptions, example names, map links and source notes (only the visibility changed, see B3).
- Every day of every plan, with Morning, Afternoon, Evening, Stay, Meals and Tip.
- The whole Budget breakdown (only moved, see B4).
- The whole Safety content (score, "Safety at a glance" cards, highlights, solo tips, precautions, emergency contacts, safe zones, areas to avoid): the same screen, unchanged.
- From my city and the Getting around list; What to pack; City tips; Safety notices; the Trip Prep & Packing link.
- Rating, review count, time needed, the photo gallery and the photo count.

## F. Already gone before this redesign

- **"Traveler Hurdles"** (scam and safety warnings with fixes) was taken out of the How to reach tab before this work started. Only 11 places have that data, and it is still in the code.

---

## Where things live now

| Old tab | Now |
|---|---|
| About | Description and, under "Read more", the Top highlights, right under Directions; places near lower on the home page. Opening hours are the status card under the photo. |
| Day plan | "A day at …" card on the home page |
| Stay | Where to stay (row 1) |
| Budget | Bottom of Where to stay |
| How to reach: Getting There, Getting Around | How to get there (row 2) |
| How to reach: What to Pack, City Essentials, Travel Advisory, Trip Prep link | What to know before I go (row 3) |
| Safety | Is it safe? (row 4) |

---

## G. Removed at your request (after the first version of this note)

| # | What | Before | Now | What you no longer see |
|---|---|---|---|---|
| G1 | **Time needed** card | "Time needed: 2–3 hours" under the photo | Removed | The visit length is gone from the photo area. It still appears on the budget card at the bottom of Where to stay ("For 2–3 hours"). |
| G2 | **Save and Share beside Directions** | Three buttons: Directions, Save, Share | One full-width Directions button | Nothing: Save and Share are still the two round buttons on the photo. |
| G3 | **"Back" word** | A pill reading "Back" with an arrow | A round arrow icon, 44 points, same size as Share and Save | The word "Back" (screen readers still say "Back"). On the four pages it still says "Back to <place>" for screen readers. |
| G4 | **Short "Best time" card** | "Best time: Nov – Apr" | Replaced by the one-line months note (A1) | The card itself; the months now sit in a one-line note under the status. |

- ☐ **Bring Time needed back?** (for example as one more line in the note: "Time needed: 2–3 hours")

---

## H. Opening hours card removed (your request, same day)

**What it was:** a card in the lower part of the home page: "Opening hours  9:00 AM – 6:30 PM", and under it the place's own note.

**What you still see:** the status card under the photo (Open now or Closed, closing or opening time, usual hours, "Open daily" or "Closed Mondays").

**What is no longer visible anywhere (this card was the only place it appeared):**

| What | Places affected | Examples from the data |
|---|---|---|
| **The place's note**, other than a plain "Open daily" or "Closed Mondays" | **855** of the 1,024 places with hours (only 168 notes were already fully shown in the status card) | "Closed Sundays and Mondays; entry requires ID and advance online booking." (Capitol Complex) · "Open daily; boating operates during daylight hours only." (Sukhna Lake) · "Part of the haveli is a private residence." |
| **Entry fees and ticket prices** inside those notes | **260** places | "Entry: ₹50 (adults), ₹30 (children). Rose Festival (Feb–Mar): separate tickets, ₹100–₹200." (Rose Garden) · "Entry: ₹10 (Indians), ₹50 (foreigners). Photography may be restricted in some galleries." (Chandigarh Museum) |
| Other rules in notes | included in the 855 | closing on national holidays, photography limits, last-entry and last-ferry times, festival timings |
| The day-by-day weekly list | **0 places today** | It only existed for live Google hours, which need a Google key you chose not to set up, so no place ever showed it. |

**What is not lost:** the data itself. Every note is still stored on each place and nothing was deleted. The Opening hours card component and the Google-hours lookup are still in the code, only unused.

**One more change under the hood:** the page no longer asks our server for live Google hours on every visit (that call was only feeding the removed card, and always failed without a key).

- ☐ **Bring the note back?** The smallest option: one extra line under the "Usual hours" line in the status card, showing the note when it has more than "Open daily" (for example "Entry: ₹50 adults, ₹30 children"). Or only entry fees. Or leave as is.

### H2. Is live opening-hours data available for free? (checked 17 Oct 2026)

I tested it on a real, evenly spread sample of **90 places that have coordinates** (601 of the 1,952 places have coordinates; the other 1,351 could not be looked up at all).

| Free source | Result |
|---|---|
| **OpenStreetMap place search** (free, needs no key, limited to 1 request a second) | The place was found for **52** of the 90, but only **1 of 90 (about 1%)** had opening hours: Rock Garden, as "Mo-Su 09:00-20:00". Even that disagrees with the 6:30 PM closing we have from an official source. |
| **OpenStreetMap bulk server (Overpass)** | Could not be tested: the main public server timed out from here and the mirrors answered with errors or "white-listed users only". The backend's own comments say it also refuses connections from Render's hosting. It would not be dependable for an app. |
| **Wikidata** | No opening-hours property on Rock Garden's entry (17 facts, none about hours). Not a source for hours. |
| **Free tiers that need a sign-up key** (Geoapify, TomTom, HERE, Foursquare) | Not tested: each needs an account and key that only you can create. Geoapify's places data comes from OpenStreetMap, so it would have the same gap. TomTom, HERE and Foursquare have their own data and free allowances, but I found no evidence of India coverage for heritage sites, and Foursquare's hours may be a paid feature. |

**Verdict:** there is no free source that covers these places. So the app keeps using the hours we hold (1,024 places, from official and curated sources) for the status card, and the live Google lookup stays switched off. Nothing was lost by that, because it never returned data without a Google key. The code for it is still there if you ever want to try a TomTom or HERE key: it would feed the same top status card.

---

## I. Top highlights moved into the About block (your request, same day)

| What | Before | Now |
|---|---|---|
| **Where** | Its own "Top Highlights" section below the day plan | Inside "About <place>", directly under the description |
| **Visibility** | Always visible | **Hidden until "Read more"** (shown with the full description; "Show less" folds both away) |
| **Look** | Numbered cards with indigo circles, 13px medium text | A numbered list in the **same body text as the description** (15px, same font, same colour) |
| **Links** | 184 highlights (in 104 places) open another place's page | Still open that page; marked with a chevron |

- **What this changes for visitors:** all **1,952** places have highlights, and they are no longer visible when the page opens. A visitor sees them only after tapping "Read more". If you would like them visible by default, say so: the block can start open, or show just the first two highlights with the rest behind "Read more".

## J. "Where to stay" became "Hotels" (2026-10-17)

| | Before | Now |
|---|---|---|
| **Row name** | Where to stay · "From ₹1,000 a night" | **Hotels** · "9 hotels · from ₹1,000 a night" (places with no named hotel keep the old preview) |
| **Page top** | Price ladder | Map button, level buttons (only when the hotels span 2+ levels), one card per hotel the guide names, then the price ladder (unchanged) and "What a day costs" |
| **Hotel names** | Inside each opened price level ("EXAMPLES") | On their own cards. A line already shown as a card is not repeated in the ladder; general advice lines ("Hotels near the bus stand") stay in the ladder |
| **Map links** | One "See stays on the map" button at the bottom; recommended venues tappable inside the ladder | The same Google Maps search now sits at the top ("See hotels on the map") plus "See on map" on every card; venues became cards |

- **Nothing was deleted.** Level descriptions, source notes, general advice lines and every price are still on the page.
- **What a card holds:** name, area, stay level and that level's typical price, because the guide holds no price, photo or rating for any single hotel. 353 of 1,952 places (18%) have at least one named hotel (1,086 in all); the rest show a plain note and the map button.
