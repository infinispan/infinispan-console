interface Cluster {
  health: string;
}

interface ClusterManager {
  name: string;
  physical_addresses: [];
  coordinator: boolean;
  cluster_name: string;
  cache_manager_status: string
  cluster_size: number;
  defined_caches: [];
}

interface InfinispanServer {
  version: string;
}

interface CmStats {
  statistics_enabled: boolean;
}
  // time_since_start":1,
  // time_since_reset":1,
  // number_of_entries":0,
  // total_number_of_entries":0,
  // off_heap_memory_used":0,
  // data_memory_used":0,
  // misses":0,
  // remove_hits":0,
  // remove_misses":0,
  // evictions":0,
  // average_read_time":0,
  // average_read_time_nanos":0,
  // average_write_time":0,
  // average_write_time_nanos":0,
  // average_remove_time":0,
  // average_remove_time_nanos":0,
  // required_minimum_number_of_nodes":1,
  // hits":0,
  // stores":0,
  // current_number_of_entries_in_memory":0,
  // hit_ratio":0.0,
  // retrievals":0


interface Cache {
  name: string;
  started: boolean;
}
