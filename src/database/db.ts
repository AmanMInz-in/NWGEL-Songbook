import * as SQLite from 'expo-sqlite';
import { Song, SongbookId } from '../types/song';
import kurukhDandiData from '../data/kurukhDandi.json';
import sakshiVaniData from '../data/sakshiVani.json';

const ALL_BUNDLED_SONGS: Song[] = [
  ...(kurukhDandiData as Song[]),
  ...(sakshiVaniData as Song[])
];

const BUNDLED_SONGS_MAP = new Map<string, Song>(
  ALL_BUNDLED_SONGS.map(s => [s.id, s])
);

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('nwgel_songs.db');
    await initSchema(dbInstance);
  }
  return dbInstance;
}

async function initSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY NOT NULL,
      bookId TEXT NOT NULL,
      number INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT,
      rawSections TEXT NOT NULL,
      searchIndex TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_songs_book_number ON songs (bookId, number);
  `);

  await syncBundledSongs(db);
}

async function syncBundledSongs(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    const countRow = await db.getFirstAsync<{ count: number }>('SELECT count(*) as count FROM songs;');
    if (countRow && countRow.count >= ALL_BUNDLED_SONGS.length) {
      return; // Already synced! Instant startup!
    }

    await db.withTransactionAsync(async () => {
      for (const song of ALL_BUNDLED_SONGS) {
        const searchBody = song.sections.map(s => s.text).join(' ');
        const searchIndex = `${song.number} ${song.title} ${song.category || ''} ${searchBody}`.toLowerCase();

        await db.runAsync(
          `INSERT OR REPLACE INTO songs (id, bookId, number, title, category, rawSections, searchIndex)
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [
            song.id,
            song.bookId,
            song.number,
            song.title,
            song.category || null,
            JSON.stringify(song.sections),
            searchIndex
          ]
        );
      }
    });
  } catch (err) {
    console.warn('syncBundledSongs error:', err);
  }
}

export async function getSongsByBook(bookId: SongbookId): Promise<Song[]> {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      id: string;
      bookId: string;
      number: number;
      title: string;
      category: string | null;
      rawSections: string;
    }>('SELECT id, bookId, number, title, category, rawSections FROM songs WHERE bookId = ? ORDER BY number ASC;', [bookId]);

    if (rows && rows.length > 0) {
      return rows.map(r => ({
        id: r.id,
        bookId: r.bookId as SongbookId,
        number: r.number,
        title: r.title,
        category: r.category || undefined,
        sections: JSON.parse(r.rawSections)
      }));
    }
  } catch (err) {
    console.warn('getSongsByBook error, using bundled data:', err);
  }

  return (bookId === 'kurukh-dandi' ? (kurukhDandiData as Song[]) : (sakshiVaniData as Song[]))
    .slice()
    .sort((a, b) => a.number - b.number);
}

export async function getSongById(id: string): Promise<Song | null> {
  const cached = BUNDLED_SONGS_MAP.get(id);
  if (cached) return cached;

  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{
      id: string;
      bookId: string;
      number: number;
      title: string;
      category: string | null;
      rawSections: string;
    }>('SELECT id, bookId, number, title, category, rawSections FROM songs WHERE id = ?;', [id]);

    if (!row) return null;

    return {
      id: row.id,
      bookId: row.bookId as SongbookId,
      number: row.number,
      title: row.title,
      category: row.category || undefined,
      sections: JSON.parse(row.rawSections)
    };
  } catch (err) {
    console.warn('getSongById db error:', err);
    return BUNDLED_SONGS_MAP.get(id) || null;
  }
}

export async function getSongByBookAndNumber(bookId: SongbookId, number: number): Promise<Song | null> {
  const inMemory = ALL_BUNDLED_SONGS.find(s => s.bookId === bookId && s.number === number);
  if (inMemory) return inMemory;

  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{
      id: string;
      bookId: string;
      number: number;
      title: string;
      category: string | null;
      rawSections: string;
    }>('SELECT id, bookId, number, title, category, rawSections FROM songs WHERE bookId = ? AND number = ? LIMIT 1;', [bookId, number]);

    if (!row) return null;

    return {
      id: row.id,
      bookId: row.bookId as SongbookId,
      number: row.number,
      title: row.title,
      category: row.category || undefined,
      sections: JSON.parse(row.rawSections)
    };
  } catch (err) {
    console.warn('getSongByBookAndNumber db error:', err);
    return ALL_BUNDLED_SONGS.find(s => s.bookId === bookId && s.number === number) || null;
  }
}

export async function getAdjacentSongIds(bookId: SongbookId, currentNumber: number): Promise<{ prevId: string | null; nextId: string | null }> {
  const db = await getDatabase();
  const prevRow = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM songs WHERE bookId = ? AND number < ? ORDER BY number DESC LIMIT 1;',
    [bookId, currentNumber]
  );
  const nextRow = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM songs WHERE bookId = ? AND number > ? ORDER BY number ASC LIMIT 1;',
    [bookId, currentNumber]
  );

  return {
    prevId: prevRow?.id || null,
    nextId: nextRow?.id || null
  };
}

export async function searchSongs(query: string, bookIdFilter?: SongbookId): Promise<Song[]> {
  const db = await getDatabase();
  const trimmed = query.trim().toLowerCase();
  const cleanQuery = `%${trimmed}%`;
  const numMatch = parseInt(trimmed, 10);
  const isNumeric = !isNaN(numMatch) && numMatch > 0;

  let sql = 'SELECT id, bookId, number, title, category, rawSections FROM songs WHERE searchIndex LIKE ?';
  const params: (string | number)[] = [cleanQuery];

  if (bookIdFilter) {
    sql += ' AND bookId = ?';
    params.push(bookIdFilter);
  }

  if (isNumeric) {
    sql += ' ORDER BY (CASE WHEN number = ? THEN 0 ELSE 1 END), number ASC LIMIT 50;';
    params.push(numMatch);
  } else {
    sql += ' ORDER BY number ASC LIMIT 50;';
  }

  const rows = await db.getAllAsync<{
    id: string;
    bookId: string;
    number: number;
    title: string;
    category: string | null;
    rawSections: string;
  }>(sql, params);

  return rows.map(r => ({
    id: r.id,
    bookId: r.bookId as SongbookId,
    number: r.number,
    title: r.title,
    category: r.category || undefined,
    sections: JSON.parse(r.rawSections)
  }));
}