import { RestUtils } from '@services/utils';

export class TasksService {
  endpoint: string;
  utils: RestUtils;

  constructor(endpoint: string, restUtils: RestUtils) {
    this.endpoint = endpoint;
    this.utils = restUtils;
  }

  public getTasks(): Promise<Task[]> {
    return this.utils
      .restCall(this.endpoint + '?type=user', 'GET')
      .then((response) => response.json())
      .then((tasks) =>
        tasks.map(
          (task) =>
            <Task>{
              parameters: task.parameters,
              task_context_name: task.task_context_name,
              task_operation_name: task.task_operation_name,
              name: task.name,
              type: task.type,
              execution_mode: task.execution_mode,
              allowed_role: task.allowed_role,
            }
        )
      );
  }
}
