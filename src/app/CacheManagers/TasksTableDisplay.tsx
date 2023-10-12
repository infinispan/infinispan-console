import React, { useEffect, useState } from 'react';
import { TableVariant } from '@patternfly/react-table';
import { Table, TableBody, TableHeader } from '@patternfly/react-table/deprecated';
import {
  Badge,
  Bullseye,
  Card,
  CardBody,
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
  EmptyStateHeader,
  EmptyStateFooter
} from '@patternfly/react-core';
import { DatabaseIcon, SearchIcon } from '@patternfly/react-icons';
import displayUtils from '@services/displayUtils';
import {
  chart_color_blue_500,
  global_FontSize_sm,
  global_spacer_md,
  global_spacer_sm,
  global_spacer_xs
} from '@patternfly/react-tokens';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';

const TasksTableDisplay = (props: { setTasksCount: (number) => void; isVisible: boolean }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  const [tasksPagination, setTasksPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [rows, setRows] = useState<(string | any)[]>([]);
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const columns = [
    { title: t('cache-managers.task-name') },
    {
      title: t('cache-managers.task-type')
    },
    {
      title: t('cache-managers.context-name')
    },
    {
      title: t('cache-managers.operation-name')
    },
    {
      title: t('cache-managers.parameters')
    },
    {
      title: t('cache-managers.allowed-role')
    }
  ];

  useEffect(() => {
    ConsoleServices.tasks()
      .getTasks()
      .then((maybeTasks) => {
        if (maybeTasks.isRight()) {
          setTasks(maybeTasks.value);
          setFilteredTasks(maybeTasks.value);
          props.setTasksCount(maybeTasks.value.length);
          const initSlice = (tasksPagination.page - 1) * tasksPagination.perPage;
          updateRows(maybeTasks.value.slice(initSlice, initSlice + tasksPagination.perPage));
        } else {
          // TODO: deal loading, error, empty status
        }
      });
  }, []);

  const onSetPage = (_event, pageNumber) => {
    setTasksPagination({
      page: pageNumber,
      perPage: tasksPagination.perPage
    });
    const initSlice = (pageNumber - 1) * tasksPagination.perPage;
    updateRows(filteredTasks.slice(initSlice, initSlice + tasksPagination.perPage));
  };

  const onPerPageSelect = (_event, perPage) => {
    setTasksPagination({
      page: tasksPagination.page,
      perPage: perPage
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
          paddingLeft: global_spacer_sm.value
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

  const emptyPage = (
    <EmptyState variant={EmptyStateVariant.lg}>
      <EmptyStateHeader
        titleText={t('cache-managers.tasks.no-tasks-status')}
        icon={<EmptyStateIcon icon={DatabaseIcon} />}
        headingLevel="h4"
      />
      <EmptyStateBody>{t('cache-managers.tasks.no-tasks-body')}</EmptyStateBody>
    </EmptyState>
  );

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
                  {
                    <EmptyState variant={EmptyStateVariant.sm}>
                      <EmptyStateHeader
                        titleText={<>{t('cache-managers.tasks.no-filtered-task')}</>}
                        icon={<EmptyStateIcon icon={SearchIcon} />}
                        headingLevel="h2"
                      />
                      <EmptyStateBody>{t('cache-managers.tasks.no-filtered-task-body')}</EmptyStateBody>
                    </EmptyState>
                  }
                </Bullseye>
              )
            }
          ]
        }
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
            { title: taskAllowedRoles(task.allowed_role) }
          ]
          //TODO {title: <TasksActionLinks name={task.name}/>}]
        };
      });
    }
    setRows(rows);
  };

  if (!props.isVisible) {
    return <span />;
  }
  if (tasks.length == 0) {
    return emptyPage;
  }

  return (
    <Card>
      <CardBody>
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
      </CardBody>
    </Card>
  );
};

export { TasksTableDisplay };
