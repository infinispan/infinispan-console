import utils from './utils';

class TasksService {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public getTasks(): Promise<Task[]> {
    return utils
      .restCall(this.endpoint + '/tasks?type=user', 'GET')
      .then(response => response.json())
      .then(tasks =>
        tasks.map(
          task =>
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

const tasksService: TasksService = new TasksService(utils.endpoint());

export default tasksService;
