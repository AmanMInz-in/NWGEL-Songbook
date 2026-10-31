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

## Authors & Acknowledgments

An independent, open-source project maintained by its contributors, this app
brings the *Sakshi Vani* and *Kurukh Dandi* hymn collections together in an
offline-friendly experience. It is not an official publication of any church.
Hymn texts are presented for reference and worship; rights and attribution
remain with their respective owners.

### Core Engineering & Lead Development

**Aman Minz** — *Lead Developer, Software Architect & Database Designer*

- Designed and built the entire application architecture from scratch.
- Designed the database schemas, indexing system, and offline synchronization
  logic.
- Implemented all UI/UX design, search algorithms, and application features.
- Digitized, formatted, and structured the song database for **Sakshi Vani**.
- GitHub: [@AmanMInz-in](https://github.com/AmanMInz-in) |
  LinkedIn: [amanminz](https://linkedin.com/in/amanminz)

### Content Archiving & Data Curation

**Adarsh Toppo** — *Hymnal Archivist & Content Contributor*

- Gathered, transcribed, and structured the hymn collection for **Kurukh
  Dandi**.
- Collaborated on reviewing, proofreading, and verifying the lyrics for
  **Sakshi Vani**.

*Dedicated to preserving hymn traditions and serving the worshippers who cherish them.*
