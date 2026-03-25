export interface SearchResult {
  total: number;
  values: string[];
  error: boolean;
  cause: string;
  executed: boolean;
}

export interface DeleteByQueryResult {
  hit_count: number;
  hit_count_exact: number;
}

export interface IndexStat {
  name: string;
  count: string;
  size: string;
}

export interface QueryStat {
  name: string;
  count: string;
  average: string;
  max: string;
  slowest?: string;
}

export interface SearchStats {
  index: IndexStat[];
  query: QueryStat[];
  reindexing: boolean;
}

export interface IndexMetamodel {
  entityName: string;
  indexName: string;
  valueFields: IndexValueField[];
}

export interface IndexValueField {
  name: string;
  multiValued: boolean;
  multiValuedInRoot: boolean;
  type: string;
  projectionType: string;
  argumentType: string;
  searchable: boolean;
  sortable: boolean;
  projectable: boolean;
  aggregable: boolean;
  analyzer: string;
}

export interface QueryHistoryItem {
  query: string;
  total: number;
  milliseconds: string;
  error: boolean;
  cause: string;
  type: 'Search' | 'Delete' | 'Vector';
}

export type HistoryMap = Record<string, QueryHistoryItem[]>;
