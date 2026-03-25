export interface ClusterMember {
  version: string;
  node_address: string;
  physical_addresses: string;
  cache_manager_status: string;
}

export interface ClusterMembers {
  rolling_upgrade: boolean;
  members: ClusterMember[];
  memory_available: number;
  memory_used: number;
}

export interface ClusterDistribution {
  node_name: string;
  node_addresses: string[];
  memory_available: number;
  memory_used: number;
}

export interface CacheManager {
  name: string;
  isLocal: boolean;
  physical_addresses: string[];
  coordinator: boolean;
  cluster_name: string;
  cache_manager_status: import('./common').ComponentStatusType;
  cluster_size: number;
  defined_caches: DefinedCache[];
  cache_configuration_names: string[];
  cluster_members: ClusterMember[];
  health: import('./common').ComponentStatusType;
  local_site?: string;
  rebalancing_enabled?: boolean;
  backups_enabled: boolean;
  sites_view: string[];
  tracing_enabled: boolean;
}

export interface CacheManagerStats {
  statistics_enabled: boolean;
  time_since_start?: number;
  off_heap_memory_used?: number;
  data_memory_used?: number;
  required_minimum_number_of_nodes?: number;
}

export interface DefinedCache {
  name: string;
  started: boolean;
}

export interface ConnectedClients {
  id: number;
  'server-node-name': string;
  name?: string;
  created: string;
  principal: string;
  'local-address': string;
  'remote-address': string;
  'protocol-version': string;
  'client-library': string;
  'client-version'?: string | null;
  'ssl-application-protocol'?: string;
  'ssl-cipher-suite'?: string;
  'ssl-protocol'?: string;
  count?: number;
}
