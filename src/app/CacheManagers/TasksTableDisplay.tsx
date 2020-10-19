import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from '@patternfly/react-table';
import {
  Badge,
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Pagination,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import displayUtils from '@services/displayUtils';
import {
  chart_color_blue_500,
  global_FontSize_sm,
  global_spacer_md,
  global_spacer_sm,
  global_spacer_xs,
} from '@patternfly/react-tokens';
import tasksService from '@services/tasksService';
import { useTranslation } from 'react-i18next';

const TasksTableDisplay = (props: {
  setTasksCount: (number) => void;
  isVisible: boolean;
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  const [tasksPagination, setTasksPagination] = useState({
    page: 1,
    perPage: 10,
  });
  const [rows, setRows] = useState<(string | any)[]>([]);
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const columns = [
    { title: t('cache-managers.task-name'), },
    {
      title: t('cache-managers.task-type'),
    },
    {
      title: t('cache-managers.context-name'),
    },
    {
      title: t('cache-managers.operation-name'),
    },
    {
      title: t('cache-managers.parameters'),
    },
    {
      title: t('cache-managers.allowed-role'),
    }
  ];

  useEffect(() => {
    tasksService.getTasks().then((tasks) => {
      setTasks(tasks);
      setFilteredTasks(tasks);
      props.setTasksCount(tasks.length);
      const initSlice = (tasksPagination.page - 1) * tasksPagination.perPage;
      updateRows(tasks.slice(initSlice, initSlice + tasksPagination.perPage));
    });
  }, []);

  const onSetPage = (_event, pageNumber) => {
    setTasksPagination({
      page: pageNumber,
      perPage: tasksPagination.perPage,
    });
    const initSlice = (pageNumber - 1) * tasksPagination.perPage;
    updateRows(
      filteredTasks.slice(initSlice, initSlice + tasksPagination.perPage)
    );
  };

  const onPerPageSelect = (_event, perPage) => {
    setTasksPagination({
      page: tasksPagination.page,
      perPage: perPage,
    });
    const initSlice = (tasksPagination.page - 1) * perPage;
    updateRows(filteredTasks.slice(initSlice, initSlice + perPage));
  };

  const taskType = (type: string) => {
    return (
      <Badge
        style={{
          backgroundColor: displayUtils.taskTypeColor(type),
          fontSize: global_FontSize_sm.value,
          color: chart_color_blue_500.value,
          fontWeight: 'lighter',
          marginRight: global_spacer_md.value,
          padding: global_spacer_xs.value,
          paddingRight: global_spacer_sm.value,
          paddingLeft: global_spacer_sm.value,
        }}
      >
        {type}
      </Badge>
    );
  };

  const taskParameters = (params: [string]) => {
    return (
      <TextContent>
        {params.map((param, index) => (
          <Text key={param + index} component={TextVariants.p}>
            {' [' + param + ']'}
          </Text>
        ))}
      </TextContent>
    );
  };

  const taskAllowedRoles = (allowedRole: string) => {
    if (allowedRole == null || allowedRole.trim().length == 0) {
      return <TextContent>{t('cache-managers.allowed-role-null')}</TextContent>;
    }
    return (
      <TextContent>
        <Text component={TextVariants.p}>{allowedRole}</Text>
      </TextContent>
    );
  };

  const updateRows = (tasks: Task[]) => {
    let rows: { heightAuto: boolean; cells: (string | any)[] }[];

    if (tasks.length == 0) {
      rows = [
        {
          heightAuto: true,
          cells: [
            {
              props: { colSpan: 8 },
              title: (
                <Bullseye>
                  <EmptyState variant={EmptyStateVariant.small}>
                    <EmptyStateIcon icon={SearchIcon} />
                    <Title headingLevel="h2" size="lg">
                      {t('cache-managers.no-tasks-status')}
                    </Title>
                    <EmptyStateBody>
                      {t('cache-managers.no-tasks-body')}
                    </EmptyStateBody>
                  </EmptyState>
                </Bullseye>
              ),
            },
          ],
        },
      ];
    } else {
      rows = tasks.map((task) => {
        return {
          heightAuto: true,
          cells: [
            { title: task.name },
            { title: taskType(task.type) },
            { title: task.task_context_name },
            { title: task.task_operation_name },
            { title: taskParameters(task.parameters) },
            { title: taskAllowedRoles(task.allowed_role) },
          ],
          //TODO {title: <TasksActionLinks name={task.name}/>}]
        };
      });
    }
    setRows(rows);
  };

  if (!props.isVisible) {
    return <span />;
  }

  return (
    <Stack>
      <StackItem>
        <Pagination
          itemCount={filteredTasks.length}
          perPage={tasksPagination.perPage}
          page={tasksPagination.page}
          onSetPage={onSetPage}
          widgetId="pagination-tasks"
          onPerPageSelect={onPerPageSelect}
          isCompact
        />
        <Table
          aria-label={t('cache-managers.tasks-table-label')}
          cells={columns}
          rows={rows}
          className={'tasks-table'}
          variant={TableVariant.compact}
        >
          <TableHeader />
          <TableBody />
        </Table>
      </StackItem>
    </Stack>
  );
};

export { TasksTableDisplay };
