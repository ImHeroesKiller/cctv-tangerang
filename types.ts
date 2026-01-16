
export enum Region {
  KOTA = 'Kota Tangerang',
  SELATAN = 'Tangerang Selatan',
  KABUPATEN = 'Kabupaten Tangerang',
  ALL = 'Semua Wilayah'
}

export interface CCTVStream {
  id: string;
  title: string;
  location: string;
  region: Region;
  youtubeId: string;
  isLive: boolean;
  category: 'Lalu Lintas' | 'Area Publik' | 'Pusat Kota';
}

export interface TrafficInsight {
  summary: string;
  sources: { title: string; uri: string }[];
  timestamp: string;
}
