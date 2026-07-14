export interface Task {
  parameters: [string];
  task_context_name: string;
  task_operation_name: string;
  name: string;
  type: string;
  execution_mode: string;
  allowed_role: string;
}

export interface ProtoError {
  message: string;
  cause: string;
}

export interface ProtoSchema {
  name: string;
  error?: ProtoError;
}

export interface ProtoSchemaDetail {
  name: string;
  content: string;
  caches: string[];
  error: ProtoError | null;
}

export interface ProtoAnnotationAttribute {
  type: string;
  defaultValue?: string;
  allowedValues: string[];
}

export interface ProtoAnnotation {
  name: string;
  target: string[];
  attributes: Record<string, ProtoAnnotationAttribute>;
}
