# NWGEL Songbook

## Adding hymns

Add hymns to the matching bundled data file:

- Kurukh hymns: `src/data/kurukhDandi.json`
- Hindi hymns: `src/data/sakshiVani.json`

Each file contains a JSON array. Add a song object using this shape:

```json
{
  "id": "kurukh-dandi-003",
  "bookId": "kurukh-dandi",
  "number": 3,
  "title": "Song title",
  "category": "Praise & Worship",
  "sections": [
    {
      "type": "verse",
      "number": 1,
      "text": "First verse lyrics..."
    },
    {
      "type": "chorus",
      "text": "Chorus lyrics..."
    }
  ]
}
```

For Sakshi Vani, use a unique ID such as `sakshi-vani-003` and set
`"bookId": "sakshi-vani"`. Song IDs must be unique; use the next unused song
number in that book. Each section's `type` can be `verse`, `chorus`, `refrain`,
or `bridge`; verse numbers are optional for other section types. The `category`
is optional.

Save the JSON and reload the app. Bundled songs are synchronized to the local
database when it opens, so newly added or edited hymns appear without clearing
the app's saved songs. Ensure the JSON remains valid (including commas between
song objects and no comma after the final object). Use authorized, proofread
lyrics before publishing.
