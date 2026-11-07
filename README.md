# NWGEL Songbook

NWGEL Songbook is an offline-friendly mobile app for browsing and reading the
**Kurukh Dandi** and **Sakshi Vani** hymn collections. Search by song number,
title, or lyrics; save favourites; and adjust the reader for use at home or
during worship.

The app is an independent project, not an official publication of any church.
Hymn texts are presented for reference and worship; rights and attribution
remain with their respective owners.

## Features

- Browse the Kurukh Dandi and Sakshi Vani collections.
- Search both collections, or filter search results by songbook.
- Search within a songbook and sort its songs by number or title.
- Read lyrics offline, move between adjacent songs, and keep the screen awake
  while reading.
- Save favourite hymns and access them from the Favourites tab.
- Adjust reading size, choose Classic, Night, Ocean, or Sepia themes, and use
  distraction-free reading.
- Share a song as text or create a themed lyric image for sharing.

The reader interface can display Hindi or English labels. Romanized Sakshi
Vani lyrics are available from the English tab for hymns with a matching
English-data entry; the current data includes hymns 1–50.

## Run the app

### Requirements

- Node.js and npm
- Android Studio and an emulator or Android device for Android development
- Xcode and an iOS simulator or device for iOS development (macOS only)

### Install and start

```sh
npm install
npm start
```

Use the Expo development server to open the app on a configured emulator or
device. Platform-specific commands are also available:

```sh
npm run android
npm run ios
npm run web
```

`npm run ios` requires macOS and Xcode. The web command starts Expo's web
target; native Android and iOS are the primary mobile platforms.

## Development commands

```sh
npm run type-check
npm run lint
```

## Project structure

```text
app/                    Expo Router screens and navigation
  (tabs)/               Home, Search, Favourites, and Settings
  books/[book].tsx      Song list for a collection
  song/[id].tsx         Song reader and sharing
src/
  components/           Reusable interface components
  constants/theme.ts    Theme palettes and typography
  context/              Preferences and favourites state
  data/                 Bundled hymn collections (JSON)
  database/db.ts        Local SQLite storage and search
  types/                Song and songbook types
```

The app uses React Native, Expo SDK 51, Expo Router, and TypeScript. Bundled
song data is synchronized to a local SQLite database when the database opens.
Theme and reading-size preferences, favourites, and recent song IDs are stored
locally on the device.

English-script song data:

- Sakshi Vani: [`src/data/sakshiVaniEnglish.json`](src/data/sakshiVaniEnglish.json)
- Kurukh Dandi: [`src/data/kurukhDandiEnglish.json`](src/data/kurukhDandiEnglish.json)

The Sakshi Vani English data is displayed by the reader's English tab when a
matching hymn is available. The Kurukh Dandi English file is an empty starter
and is not loaded by the app.

## Updating hymn data

Edit the matching JSON file:

- Kurukh Dandi: [`src/data/kurukhDandi.json`](src/data/kurukhDandi.json)
- Sakshi Vani: [`src/data/sakshiVani.json`](src/data/sakshiVani.json)

Each file contains an array of songs. Add a song using this structure:

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

For Sakshi Vani, use `"bookId": "sakshi-vani"` and a unique ID such as
`"sakshi-vani-003"`. IDs must be unique across the bundled collections; use
the next unused song number within the selected book. Section types are
`verse`, `chorus`, `refrain`, and `bridge`. Verse numbers and `category` are
optional where appropriate.

Keep the JSON valid and preserve existing song IDs so saved favourites and
recent-song references continue to work. Bundled songs are synchronized when
the app opens, so data edits appear without clearing local preferences.
Proofread changes and confirm authorization, attribution, and rights before
publishing hymn text.

## Contributors

### Aman Minz — Lead Developer

Designed and implemented the app architecture, database, offline
synchronization, interface, and search. Digitized and structured the Sakshi
Vani collection.

- GitHub: [@AmanMInz-in](https://github.com/AmanMInz-in)
- LinkedIn: [amanminz](https://linkedin.com/in/amanminz)

### Adarsh Toppo — Hymnal Archivist and Content Contributor

Gathered, transcribed, and structured Kurukh Dandi hymns, and collaborated on
reviewing Sakshi Vani lyrics.

*Dedicated to preserving hymn traditions and serving the worshippers who
cherish them.*
