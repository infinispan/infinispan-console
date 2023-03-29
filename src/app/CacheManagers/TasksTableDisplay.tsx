import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  ButtonVariant,
  DataList,
  DataListCell,
  DataListContent,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DataListToggle,
  Pagination,
  Title,
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItemVariant,
  Stack,
  StackItem,
  Spinner
} from '@patternfly/react-core';
import { CodeEditor } from '@patternfly/react-code-editor';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTranslation } from 'react-i18next';
import { useFetchTask } from '@app/services/tasksHook';
import { ExecuteTasks } from '@app/Tasks/ExecuteTasks';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { useConnectedUser } from '@app/services/userManagementHook';
import { CreateTask } from '@app/Tasks/CreateTask';
import { SearchIcon } from '@patternfly/react-icons';
import { useApiAlert } from '@app/utils/useApiAlert';

const TasksTableDisplay = (props: { setTasksCount: (number) => void; isVisible: boolean }) => {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { tasks, loading, error, reload } = useFetchTask();
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [tasksPagination, setTasksPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [taskToExecute, setTaskToExecute] = useState<Task>();
  const [isCreateTask, setIsCreateTask] = useState(false);
  const { connectedUser } = useConnectedUser();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [editTaskName, setEditTaskName] = useState<string>('');
  const [editScript, setEditScript] = useState<string>('');
  const [scriptContent, setScriptContent] = useState(new Map<string, string>());
  const [scriptError, setScriptError] = useState<string>('');

  useEffect(() => {
    if (loading) {
      props.setTasksCount(tasks.length);
      const initSlice = (tasksPagination.page - 1) * tasksPagination.perPage;
      setFilteredTasks(tasks.slice(initSlice, initSlice + tasksPagination.perPage));
    }
  }, [loading, tasks, error]);

  useEffect(() => {
    if (filteredTasks) {
      const initSlice = (tasksPagination.page - 1) * tasksPagination.perPage;
      setFilteredTasks(tasks.slice(initSlice, initSlice + tasksPagination.perPage));
    }
  }, [tasksPagination]);

  const onSetPage = (_event, pageNumber) => {
    setTasksPagination({
      page: pageNumber,
      perPage: tasksPagination.perPage
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setTasksPagination({
      page: 1,
      perPage: perPage
    });
  };

  const loadScript = (taskName: string) => {
    ConsoleServices.tasks()
      .fetchScript(taskName)
      .then((eitherResponse) => {
        if (eitherResponse.isRight()) {
          scriptContent.set(taskName, eitherResponse.value);
        } else {
          scriptContent.set(taskName, t('cache-managers.tasks.script-load-error'));
        }
      });
  };

  const handleEdit = (taskName: string) => {
    if (editTaskName == '' || editTaskName != taskName) {
      setEditTaskName(taskName);
      setEditScript(scriptContent.get(taskName) as string);
    } else {
      // save script

      if (!scriptContent.has(taskName) || scriptContent.get(taskName) == '') {
        return;
      }

      // Do not update if script not changed
      if (scriptContent.get(taskName) == editScript) {
        setEditTaskName('');
        setEditScript('');
        return;
      }

      ConsoleServices.tasks()
        .createOrUpdateTask(taskName, editScript, false)
        .then((actionResponse) => {
          if (actionResponse.success) {
            setScriptError('');
            setEditTaskName('');
            addAlert(actionResponse);
            loadScript(taskName);
          } else {
            setScriptError(actionResponse.message);
          }
        })
        .then(() => reload());
    }
  };

  const buildCreateTaskButton = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser)) {
      return <ToolbarItem />;
    }
    return (
      <React.Fragment>
        <ToolbarItem>
          <Button onClick={() => setIsCreateTask(!isCreateTask)} aria-label="create-task-button">
            {t('cache-managers.tasks.create-task')}
          </Button>
        </ToolbarItem>
      </React.Fragment>
    );
  };

  const toggle = (taskName) => {
    const index = expanded.indexOf(taskName);
    const newExpanded =
      index >= 0
        ? [...expanded.slice(0, index), ...expanded.slice(index + 1, expanded.length)]
        : [...expanded, taskName];
    setExpanded(newExpanded);
  };

  const errorInScript = (taskName) => {
    return scriptContent.get(taskName) === t('cache-managers.tasks.script-load-error');
  };

  const buildTaskToolbar = (taskName) => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser)) {
      return '';
    }

    return (
      <Toolbar>
        <ToolbarGroup>
          <ToolbarItem>
            <Button
              isDisabled={(editTaskName === taskName.name && editScript.length === 0) || errorInScript(taskName.name)}
              id={'edit-button-' + taskName.name}
              name={'edit-button-' + taskName.name}
              aria-label={'edit-button-' + taskName.name}
              variant={ButtonVariant.secondary}
              onClick={() => handleEdit(taskName.name)}
            >
              {editTaskName == taskName.name
                ? t('cache-managers.tasks.save-button')
                : t('cache-managers.tasks.edit-button')}
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button
              isDisabled={errorInScript(taskName.name)}
              id={'execute-button-' + taskName.name}
              name={'execute-button-' + taskName.name}
              aria-label={'execute-button-' + taskName.name}
              variant={ButtonVariant.link}
              onClick={() => {
                if (editTaskName == taskName.name) {
                  setEditTaskName('');
                } else {
                  setTaskToExecute(taskName);
                }
              }}
            >
              {editTaskName == taskName.name
                ? t('cache-managers.tasks.cancel-button')
                : t('cache-managers.tasks.execute-button')}
            </Button>
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
    );
  };

  const buildTaskScriptContent = (name) => {
    if (!scriptContent.get(name)) {
      loadScript(name);
      return <Spinner size={'sm'} />;
    }
    if (editTaskName != name) {
      return (
        <SyntaxHighlighter wrapLines={false} style={githubGist} useInlineStyles={true} showLineNumbers={true}>
          {scriptContent.get(name)}
        </SyntaxHighlighter>
      );
    }
    return (
      <>
        {scriptError.length > 0 && (
          <Alert variant="danger" isInline title={scriptError} style={{ marginBottom: '1rem' }} />
        )}
        <CodeEditor
          id="task-edit-area"
          data-cy="taskEditArea"
          isLineNumbersVisible
          code={editScript}
          onChange={(v) => setEditScript(v)}
          height="200px"
        />
      </>
    );
  };

  const buildTasksList = () => {
    if (filteredTasks.length == 0) {
      return (
        <Bullseye>
          <EmptyState variant={EmptyStateVariant.small}>
            <EmptyStateIcon icon={SearchIcon} />
            <Title headingLevel="h2" size="lg">
              {t('cache-managers.tasks.no-tasks-status')}
            </Title>
            <EmptyStateBody>{t('cache-managers.tasks.no-tasks-body')}</EmptyStateBody>
          </EmptyState>
        </Bullseye>
      );
    }

    return (
      <DataList aria-label="data-list-tasks">
        {filteredTasks.map((task) => {
          return (
            <DataListItem
              id={'item-' + task.name}
              key={'key-' + task.name}
              aria-labelledby={task.name + '-list-item'}
              isExpanded={expanded.includes(task.name)}
            >
              <DataListItemRow>
                <DataListToggle
                  onClick={() => toggle(task.name)}
                  isExpanded={expanded.includes(task.name)}
                  id={task.name}
                  aria-label={'expand-task-' + task.name}
                  aria-controls={'ex-' + task.name}
                />
                <DataListItemCells
                  dataListCells={[
                    <DataListCell width={2} key={'tasks-name-' + task.name}>
                      {task.name}
                    </DataListCell>,
                    <DataListCell width={2} key={'tasks-actions-' + task.name}>
                      {expanded.includes(task.name) ? buildTaskToolbar(task) : ''}
                    </DataListCell>
                  ]}
                />
              </DataListItemRow>
              <DataListContent
                aria-label="Primary content details"
                id={task.name}
                isHidden={!expanded.includes(task.name)}
                style={{ boxShadow: 'none' }}
              >
                {buildTaskScriptContent(task.name)}
              </DataListContent>
            </DataListItem>
          );
        })}
      </DataList>
    );
  };

  if (!props.isVisible) {
    return <span />;
  }

  return (
    <Stack hasGutter>
      <StackItem>
        <Toolbar id="task-table-toolbar">
          <ToolbarContent>
            {buildCreateTaskButton()}
            <ToolbarItem variant={ToolbarItemVariant.pagination}>
              <Pagination
                itemCount={tasks.length}
                perPage={tasksPagination.perPage}
                page={tasksPagination.page}
                onSetPage={onSetPage}
                widgetId="pagination-tasks"
                onPerPageSelect={onPerPageSelect}
                isCompact
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </StackItem>
      <StackItem>{buildTasksList()}</StackItem>
      <StackItem>
        <ExecuteTasks
          task={taskToExecute}
          isModalOpen={taskToExecute != undefined}
          closeModal={() => {
            setTaskToExecute(undefined);
            reload();
          }}
        />
        <CreateTask
          isModalOpen={isCreateTask}
          submitModal={() => {
            setIsCreateTask(false);
            reload();
          }}
          closeModal={() => setIsCreateTask(false)}
        />
      </StackItem>
    </Stack>
  );
};

export { TasksTableDisplay };
