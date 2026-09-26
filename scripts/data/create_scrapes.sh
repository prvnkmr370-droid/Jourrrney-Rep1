#!/bin/bash

# List of districts to scrape
districts=(
  "alwar"
  "banswara"
  "barmer"
  "baran"
  "bhilwara"
  "bundi"
  "dholpur"
  "dungarpur"
  "ganganagar:sriganganagar"
  "hanumangarh"
  "jhalawar"
  "jhunjhunu:shekhawati"
  "karauli"
  "nagaur"
  "pali"
  "rajsamand"
  "sikar"
  "tonk"
)

for district_entry in "${districts[@]}"; do
  # Handle aliases (e.g., "ganganagar:sriganganagar")
  IFS=':' read -r district_name url_part <<< "$district_entry"
  url_part=${url_part:-$district_name}
  
  filename="rajasthan-${district_name}-scrape.json"
  
  if [ ! -f "$filename" ]; then
    echo "Created placeholder for $filename"
    cat > "$filename" << SCRAPE_EOF
{
  "source": "https://www.tourism.rajasthan.gov.in/content/rajasthan-tourism/en/tourist-destinations/${url_part}.html",
  "sourceType": "Official Rajasthan Tourism website (Government of Rajasthan)",
  "scrapedDate": "2026-09-25",
  "note": "Facts extracted below; prose summaries in our own words, not copied verbatim from the source.",
  "district": "$(echo $district_name | sed 's/^./\U&/' | sed 's/-//g')",
  "about": "To be populated from source.",
  "places": [],
  "howToReach": {
    "air": "To be determined",
    "rail": "To be determined",
    "road": "To be determined"
  },
  "nearbyDistances": {}
}
SCRAPE_EOF
  fi
done
