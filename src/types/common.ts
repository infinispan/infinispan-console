export interface ComponentStatusType {
  name: string;
  status: 'danger' | 'warning' | 'info' | 'custom' | 'success';
}

export interface ActionResponse {
  message: string;
  success: boolean;
  data?: string;
}

export interface ServiceCall {
  url: string;
  successMessage: string;
  errorMessage: string;
  customHeaders?: Headers;
  body?: string;
}

export interface PaginationType {
  page: number;
  perPage: number;
}
