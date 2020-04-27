import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';
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
  Title
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import displayUtils from '../../services/displayUtils';
import { global_spacer_md } from '@patternfly/react-tokens';

const TasksTableDisplay: React.FunctionComponent<any> = (props: {
  tasks: Task[];
}) => {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([...props.tasks]);

  const [tasksPagination, setTasksPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [rows, setRows] = useState<(string | any)[]>([]);

  const columns = [
    { title: 'Name' },
    {
      title: 'Type'
    },
    {
      title: 'Context name'
    },
    {
      title: 'Operation name'
    },
    {
      title: 'Parameters'
    },
    {
      title: 'Allowed role'
    }
  ];

  useEffect(() => {
    const initSlice = (tasksPagination.page - 1) * tasksPagination.perPage;
    updateRows(
      filteredTasks.slice(initSlice, initSlice + tasksPagination.perPage)
    );
  }, []);

  const onSetPage = (_event, pageNumber) => {
    setTasksPagination({
      page: pageNumber,
      perPage: tasksPagination.perPage
    });
    const initSlice = (pageNumber - 1) * tasksPagination.perPage;
    updateRows(
      filteredTasks.slice(initSlice, initSlice + tasksPagination.perPage)
    );
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
          marginRight: global_spacer_md.value
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
      return <TextContent>-</TextContent>;
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
                      No tasks found
                    </Title>
                  </EmptyState>
                </Bullseye>
              )
            }
          ]
        }
      ];
    } else {
      rows = tasks.map(task => {
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
          aria-label="Tasks"
          cells={columns}
          rows={rows}
          className={'tasks-table'}
        >
          <TableHeader />
          <TableBody />
        </Table>
      </StackItem>
    </Stack>
  );
};

export { TasksTableDisplay };
