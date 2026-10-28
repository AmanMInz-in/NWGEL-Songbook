export type SongbookId = 'kurukh-dandi' | 'sakshi-vani';

export type SectionType = 'verse' | 'chorus' | 'refrain' | 'bridge';

export interface SongSection {
  type: SectionType;
  number?: number;
  text: string;
}

export interface Song {
  id: string;
  bookId: SongbookId;
  number: number;
  title: string;
  originalScript?: string;
  category?: string;
  sections: SongSection[];
}

export interface BookMeta {
  id: SongbookId;
  title: string;
  subtitle: string;
  language: string;
  description: string;
  accentColor: string;
}