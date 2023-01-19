import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableHeader, TableVariant } from '@patternfly/react-table';
import {
  Badge,
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Pagination,
  Text,
  TextContent,
  TextVariants,
  Title,
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  ToolbarItemVariant
} from '@patternfly/react-core';
import { TableComposable, Thead, Tr, Th, Tbody, Td, IAction, ActionsColumn } from '@patternfly/react-table';
import { SearchIcon } from '@patternfly/react-icons';
import displayUtils from '@services/displayUtils';
import {
  chart_color_blue_500,
  global_FontSize_sm,
  global_spacer_md,
  global_spacer_sm,
  global_spacer_xs
} from '@patternfly/react-tokens';
import { useTranslation } from 'react-i18next';
import { useFetchTask } from '@app/services/tasksHook';
import { ExecuteTasks } from '@app/Tasks/ExecuteTasks';

const TasksTableDisplay = (props: { setTasksCount: (number) => void; isVisible: boolean }) => {
  const { tasks, loading, error, reload } = useFetchTask();
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [tasksPagination, setTasksPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [rows, setRows] = useState<(string | any)[]>([]);
  const [taskToExecute, setTaskToExecute] = useState<Task>();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const columnNames = {
    name: t('cache-managers.tasks.task-name'),
    type: t('cache-managers.tasks.task-type'),
    context: t('cache-managers.tasks.context-name'),
    operation: t('cache-managers.tasks.operation-name'),
    parameters: t('cache-managers.tasks.parameters'),
    allowedRoles: t('cache-managers.tasks.allowed-role')
  };

  const rowActionItem = (row): IAction[] => [
    {
      title: t('cache-managers.tasks.execute'),
      onClick: () => {
        setTaskToExecute(row);
      }
    }
  ];

  useEffect(() => {
    if (tasks) {
      setFilteredTasks(tasks);
      props.setTasksCount(tasks.length);
    }
  }, [loading, tasks, error]);

  useEffect(() => {
    if (filteredTasks) {
      const initSlice = (tasksPagination.page - 1) * tasksPagination.perPage;
      const updateRows = filteredTasks.slice(initSlice, initSlice + tasksPagination.perPage);
      updateRows.length > 0 ? setRows(updateRows) : setRows([]);
    }
  }, [tasksPagination, filteredTasks]);

  const onSetPage = (_event, pageNumber) => {
    setTasksPagination({
      ...tasksPagination,
      page: pageNumber
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setTasksPagination({
      page: 1,
      perPage: perPage
    });
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
    if (params.length == 0) {
      return <TextContent>{'-'}</TextContent>;
    }
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
      return <TextContent>{t('cache-managers.tasks.allowed-role-null')}</TextContent>;
    }
    return (
      <TextContent>
        <Text component={TextVariants.p}>{allowedRole}</Text>
      </TextContent>
    );
  };

  if (!props.isVisible) {
    return <span />;
  }

  return (
    <React.Fragment>
      <Toolbar id="counters-table-toolbar">
        <ToolbarContent>
          <ToolbarItem variant={ToolbarItemVariant.pagination}>
            <Pagination
              itemCount={filteredTasks.length}
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
      <TableComposable
        className={'tasks-table'}
        aria-label={t('cache-managers.tasks.tasks-table-label')}
        variant={'compact'}
      >
        <Thead>
          <Tr>
            <Th colSpan={1}>{columnNames.name}</Th>
            <Th colSpan={1}>{columnNames.type}</Th>
            <Th colSpan={1}>{columnNames.context}</Th>
            <Th colSpan={1}>{columnNames.operation}</Th>
            <Th colSpan={1}>{columnNames.parameters}</Th>
            <Th colSpan={1}>{columnNames.allowedRoles}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tasks.length == 0 ? (
            <Tr>
              <Td colSpan={6}>
                <Bullseye>
                  <EmptyState variant={EmptyStateVariant.small}>
                    <EmptyStateIcon icon={SearchIcon} />
                    <Title headingLevel="h2" size="lg">
                      {t('cache-managers.tasks.no-tasks-status')}
                    </Title>
                    <EmptyStateBody>{t('cache-managers.tasks.no-tasks-body')}</EmptyStateBody>
                  </EmptyState>
                </Bullseye>
              </Td>
            </Tr>
          ) : (
            rows.map((row) => {
              return (
                <Tr key={row.name}>
                  <Td dataLabel={columnNames.name}>{row.name}</Td>
                  <Td dataLabel={columnNames.type}>{taskType(row.type)}</Td>
                  <Td dataLabel={columnNames.context}>{row.task_context_name}</Td>
                  <Td dataLabel={columnNames.operation}>{row.task_operation_name}</Td>
                  <Td dataLabel={columnNames.parameters}>{taskParameters(row.parameters)}</Td>
                  <Td dataLabel={columnNames.allowedRoles}>{taskAllowedRoles(row.allowed_role)}</Td>
                  <Td isActionCell>
                    <ActionsColumn items={rowActionItem(row)} />
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </TableComposable>
      <ExecuteTasks
        task={taskToExecute}
        isModalOpen={taskToExecute != undefined}
        closeModal={() => {
          setTaskToExecute(undefined);
          reload();
        }}
      />
    </React.Fragment>
  );
};

export { TasksTableDisplay };
