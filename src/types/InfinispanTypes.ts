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
}
