#!/usr/bin/env bash

# Fetches all available BAPI spec versions, determines the latest,
# and extracts tags from it. Output is used as skill context.

set -euo pipefail

API_URL="https://api.github.com/repos/clerk/openapi-specs/contents/bapi"
RAW_BASE="https://raw.githubusercontent.com/clerk/openapi-specs/main/bapi"

# Fetch version list, parse dates, sort, pick latest
versions=$(curl -s --max-time 30 --fail "$API_URL" | node -e "
  let d='';
  process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>{
    let items;
    try {
      items = JSON.parse(d)
        .map(i=>i.name)
        .filter(n=>/^\d{4}-\d{2}-\d{2}\.yml$/.test(n))
        .sort();
    } catch(e) {
      console.error('Failed to parse GitHub API response:', e.message);
latest=$(echo "$versions" | tail -1)

if [ -z "$latest" ]; then
  echo "ERROR: No BAPI spec versions found matching the expected pattern (YYYY-MM-DD.yml)" >&2
  exit 1
fi    }
curl -s --max-time 30 --fail "${RAW_BASE}/${latest}" | node "$(dirname "$0")/extract-tags.js"  });
")
latest=$(echo "$versions" | tail -1)

echo "AVAILABLE VERSIONS: $(echo "$versions" | tr '\n' ' ')"
echo "LATEST VERSION: $latest"
echo ""
echo "TAGS:"
curl -s "${RAW_BASE}/${latest}" | node "$(dirname "$0")/extract-tags.js"
