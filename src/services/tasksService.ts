import { FetchCaller } from '@services/fetchCaller';
import { Either } from '@services/either';

export class TasksService {
  endpoint: string;
  utils: FetchCaller;

  constructor(endpoint: string, restUtils: FetchCaller) {
    this.endpoint = endpoint;
    this.utils = restUtils;
  }

  public getTasks(): Promise<Either<ActionResponse, Task[]>> {
    return this.utils.get(this.endpoint + '?type=user', (tasks) =>
      tasks.map(
        (task) =>
          <Task>{
            parameters: task.parameters,
            task_context_name: task.task_context_name,
            task_operation_name: task.task_operation_name,
            name: task.name,
            type: task.type,
            execution_mode: task.execution_mode,
            allowed_role: task.allowed_role
          }
      )
    );
  }
}
