import * as SQLite from 'expo-sqlite';
import { Song, SongbookId } from '../types/song';
import kurukhDandiData from '../data/kurukhDandi.json';
import sakshiVaniData from '../data/sakshiVani.json';

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
  const allSongs: Song[] = [
    ...(kurukhDandiData as Song[]),
    ...(sakshiVaniData as Song[])
  ];

  for (const song of allSongs) {
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
}

export async function getSongsByBook(bookId: SongbookId): Promise<Song[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    bookId: string;
    number: number;
    title: string;
    category: string | null;
    rawSections: string;
  }>('SELECT id, bookId, number, title, category, rawSections FROM songs WHERE bookId = ? ORDER BY number ASC;', [bookId]);

  return rows.map(r => ({
    id: r.id,
    bookId: r.bookId as SongbookId,
    number: r.number,
    title: r.title,
    category: r.category || undefined,
    sections: JSON.parse(r.rawSections)
  }));
}

export async function getSongById(id: string): Promise<Song | null> {
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
  const cleanQuery = `%${query.trim().toLowerCase()}%`;

  let sql = 'SELECT id, bookId, number, title, category, rawSections FROM songs WHERE searchIndex LIKE ?';
  const params: (string | number)[] = [cleanQuery];

  if (bookIdFilter) {
    sql += ' AND bookId = ?';
    params.push(bookIdFilter);
  }

  sql += ' ORDER BY number ASC LIMIT 50;';

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