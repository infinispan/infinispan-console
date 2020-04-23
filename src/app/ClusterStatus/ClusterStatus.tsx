import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Bullseye,
  Card,
  CardBody,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Gallery,
  GalleryItem,
  Grid,
  GridItem,
  Label,
  PageSection,
  PageSectionVariants,
  Pagination,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextVariants,
  Title,
  Toolbar,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import {
  ClusterIcon,
  CubesIcon,
  ErrorCircleOIcon,
  InProgressIcon,
  OffIcon,
  OkIcon,
  RebalanceIcon,
  SearchIcon
} from '@patternfly/react-icons';
import dataContainerService from '../../services/dataContainerService';
import displayUtils from '../../services/displayUtils';
import { chart_color_green_300 } from '@patternfly/react-tokens';
import { Table, TableBody, TableHeader } from '@patternfly/react-table';

const ClusterStatus: React.FunctionComponent<any> = props => {
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

  const updateRows = (clusterMembers: ClusterMember[]) => {
    let rows: { heightAuto: boolean; cells: (string | any)[] }[];

    if (clusterMembers.length == 0) {
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
                      There are no cluster members
                    </Title>
                    <EmptyStateBody>
                      Are you connected to a Cluster?
                    </EmptyStateBody>
                  </EmptyState>
                </Bullseye>
              )
            }
          ]
        }
      ];
    } else {
      rows = clusterMembers.map(member => {
        return {
          heightAuto: true,
          cells: [{ title: member.name }, { title: member.physical_address }]
          //TODO {title: <ClusterMembersActionLinks name={member.name}/>}]
        };
      });
    }
    setRows(rows);
  };

  useEffect(() => {
    dataContainerService.getDefaultCacheManager().then(eitherDefaultCm => {
      if (eitherDefaultCm.isRight()) {
        setCacheManager(eitherDefaultCm.value);
        setFilteredClusterMembers(eitherDefaultCm.value.cluster_members);
        updateRows(eitherDefaultCm.value.cluster_members);
      }
    });
  }, []);

  const DisplayClusterMembershipHeader = () => {
    let sizeLabel: string = '0 members in use';
    if (cacheManager) {
      sizeLabel =
        cacheManager.cluster_size > 1
          ? cacheManager.cluster_size + ' members in use'
          : cacheManager.cluster_size + ' member in use';
    }
    return (
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Text component={TextVariants.h1}>Cluster Membership</Text>
        </TextContent>
        <Toolbar>
          <ToolbarGroup>
            <ToolbarItem>
              <TextContent>
                <Text
                  component={TextVariants.h3}
                  style={{
                    paddingRight: 10,
                    color: displayUtils.healthColor(cacheManager?.health, true)
                  }}
                >
                  <DisplayHealthIcon health={status} />
                </Text>
              </TextContent>
            </ToolbarItem>
            <ToolbarItem>
              <TextContent>
                <Text
                  component={TextVariants.h3}
                  style={{
                    paddingRight: 10,
                    fontWeight: 'bolder',
                    color: displayUtils.healthColor(cacheManager?.health, false)
                  }}
                >
                  {displayUtils.capitalize(cacheManager?.health)}
                </Text>
              </TextContent>
            </ToolbarItem>
            <ToolbarItem>
              <TextContent>
                <Text component={TextVariants.h3}>| {sizeLabel}</Text>
              </TextContent>
            </ToolbarItem>
          </ToolbarGroup>
        </Toolbar>
      </PageSection>
    );
  };

  const DisplayClusterStatus = () => {
    if (!cacheManager) {
      return (
        <EmptyState variant={EmptyStateVariant.full}>
          <EmptyStateIcon icon={CubesIcon} />
          <EmptyStateBody>The cluster is empty</EmptyStateBody>
        </EmptyState>
      );
    }
    return (
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

  const DisplayHealthIcon = (props: { health: string | undefined }) => {
    if (props.health === undefined) {
      return <OffIcon />;
    }

    let icon;
    switch (props.health) {
      case 'HEALTHY':
        icon = <OkIcon />;
        break;
      case 'HEALTHY_REBALANCING':
        icon = <RebalanceIcon />;
        break;
      case 'DEGRADED':
        icon = <ErrorCircleOIcon />;
        break;
      default:
        icon = <OkIcon />;
    }

    return icon;
  };

  return (
    <React.Fragment>
      <DisplayClusterMembershipHeader />
      <PageSection variant={PageSectionVariants.light}>
        <DisplayClusterStatus />
      </PageSection>
    </React.Fragment>
  );
};

export { ClusterStatus };
