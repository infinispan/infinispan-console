import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Alert,
  AlertVariant,
  Bullseye,
  Card,
  CardBody,
  DataToolbar,
  DataToolbarContent,
  DataToolbarItem,
  DataToolbarItemVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  PageSection,
  PageSectionVariants,
  Pagination,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextVariants,
  Title
} from '@patternfly/react-core';
import { CubesIcon, SearchIcon } from '@patternfly/react-icons';
import dataContainerService from '../../services/dataContainerService';
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant
} from '@patternfly/react-table';
import { Spinner } from '@patternfly/react-core/dist/js/experimental';
import { Health } from '@app/Common/Health';

const ClusterStatus: React.FunctionComponent<any> = props => {
  const [error, setError] = useState<undefined | string>();
  const [loading, setLoading] = useState<boolean>(true);
  const [cacheManager, setCacheManager] = useState<undefined | CacheManager>(
    undefined
  );
  const [filteredClusterMembers, setFilteredClusterMembers] = useState<
    ClusterMember[]
  >([]);
  const [clusterMembersPagination, setClusterMembersPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [rows, setRows] = useState<(string | any)[]>([]);
  const columns = [
    { title: 'Name' },
    {
      title: 'Physical address'
    }
  ];

  /* Fetch cache manager data */
  useEffect(() => {
    dataContainerService.getDefaultCacheManager().then(eitherDefaultCm => {
      if (eitherDefaultCm.isRight()) {
        setCacheManager(eitherDefaultCm.value);
        setFilteredClusterMembers(eitherDefaultCm.value.cluster_members);
        updateRows(eitherDefaultCm.value.cluster_members);
      } else {
        setError(eitherDefaultCm.value.message);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const initSlice =
      (clusterMembersPagination.page - 1) * clusterMembersPagination.perPage;
    updateRows(
      filteredClusterMembers.slice(
        initSlice,
        initSlice + clusterMembersPagination.perPage
      )
    );
  }, []);

  const onSetPage = (_event, pageNumber) => {
    setClusterMembersPagination({
      page: pageNumber,
      perPage: clusterMembersPagination.perPage
    });
    const initSlice = (pageNumber - 1) * clusterMembersPagination.perPage;
    updateRows(
      filteredClusterMembers.slice(
        initSlice,
        initSlice + clusterMembersPagination.perPage
      )
    );
  };

  const onPerPageSelect = (_event, perPage) => {
    setClusterMembersPagination({
      page: clusterMembersPagination.page,
      perPage: perPage
    });
    const initSlice = (clusterMembersPagination.page - 1) * perPage;
    updateRows(filteredClusterMembers.slice(initSlice, initSlice + perPage));
  };

  const buildEmptyState = () => {
    return (
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.small}>
          <EmptyStateIcon icon={SearchIcon} />
          <Title headingLevel="h2" size="lg">
            There are no cluster members
          </Title>
          <EmptyStateBody>Are you connected to a Cluster?</EmptyStateBody>
        </EmptyState>
      </Bullseye>
    );
  };

  const updateRows = (clusterMembers: ClusterMember[]) => {
    let rows: { heightAuto: boolean; cells: (string | any)[] }[];

    if (clusterMembers.length == 0) {
      rows = [
        {
          heightAuto: true,
          cells: [
            {
              props: { colSpan: 8 },
              title: buildEmptyState()
            }
          ]
        }
      ];
    } else {
      rows = clusterMembers.map(member => {
        return {
          heightAuto: true,
          cells: [{ title: member.name }, { title: member.physical_address }]
        };
      });
    }
    setRows(rows);
  };

  const buildHeader = () => {
    if (!cacheManager) {
      return (
        <TextContent>
          <Text component={TextVariants.h1}>Cluster</Text>
        </TextContent>
      );
    }

    const member = cacheManager.cluster_size > 1 ? ' members ' : ' member ';
    const sizeLabel = cacheManager.cluster_size + member + 'in use';

    return (
      <DataToolbar id="cluster-status-header">
        <DataToolbarContent style={{ paddingLeft: 0 }}>
          <DataToolbarItem>
            <TextContent>
              <Text component={TextVariants.h1}>Cluster Membership</Text>
            </TextContent>
          </DataToolbarItem>
        </DataToolbarContent>
        <DataToolbarContent style={{ paddingLeft: 0 }}>
          <DataToolbarItem>
            <Health health={cacheManager.health} />
          </DataToolbarItem>
          <DataToolbarItem
            variant={DataToolbarItemVariant.separator}
          ></DataToolbarItem>
          <DataToolbarItem>
            <TextContent>
              <Text component={TextVariants.p}>{sizeLabel}</Text>
            </TextContent>
          </DataToolbarItem>
        </DataToolbarContent>
      </DataToolbar>
    );
  };

  const buildClusterStatus = () => {
    if (loading && !error) {
      return (
        <Card>
          <CardBody>
            <Spinner size="xl" />
          </CardBody>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <CardBody>
            <Alert title={error} variant={AlertVariant.danger} isInline />}
          </CardBody>
        </Card>
      );
    }

    if (!cacheManager) {
      return (
        <EmptyState variant={EmptyStateVariant.full}>
          <EmptyStateIcon icon={CubesIcon} />
          <EmptyStateBody>The cluster is empty</EmptyStateBody>
        </EmptyState>
      );
    }
    return (
      <Card>
        <CardBody>
          <Stack>
            <StackItem>
              <Pagination
                itemCount={filteredClusterMembers.length}
                perPage={clusterMembersPagination.perPage}
                page={clusterMembersPagination.page}
                onSetPage={onSetPage}
                widgetId="pagination-cluster-members"
                onPerPageSelect={onPerPageSelect}
                isCompact
              />
            </StackItem>
            <StackItem>
              <Table
                variant={TableVariant.compact}
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
        </CardBody>
      </Card>
    );
  };

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        {buildHeader()}
      </PageSection>
      <PageSection>{buildClusterStatus()}</PageSection>
    </React.Fragment>
  );
};

export { ClusterStatus };
