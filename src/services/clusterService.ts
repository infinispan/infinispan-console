import { FetchCaller } from './fetchCaller';
import { Either } from './either';

/**
 * Cluster Service calls Infinispan endpoints related to cluster endpoints
 */
export class ClusterService {
  endpoint: string;
  fetchCaller: FetchCaller;

  constructor(endpoint: string, fetchCaller: FetchCaller) {
    this.endpoint = endpoint;
    this.fetchCaller = fetchCaller;
  }

  public async getClusterDistribution(): Promise<Either<ActionResponse, ClusterDistribution[]>> {
    return this.fetchCaller.get(this.endpoint + '?action=distribution', (text) => text);
  }

  public async getClusterMembers(): Promise<Either<ClusterMembers, ActionResponse>> {
    return this.fetchCaller.get(this.endpoint + '/members', (text) => text);
  }
}
