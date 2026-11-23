export interface RemoteStoreConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  realm?: string;
  secured?: boolean;
}

export interface CacheUpgradeStatus {
  cacheName: string;
  connected: boolean;
  syncing: boolean;
  synced: boolean;
  entriesSynced?: number;
}
