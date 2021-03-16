import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Bullseye,
  Card,
  CardBody,
  Divider,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Flex,
  FlexItem,
  PageSection,
  PageSectionVariants,
  Pagination,
  Spinner,
  Text,
  TextContent,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { CubesIcon, SearchIcon } from '@patternfly/react-icons';
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from '@patternfly/react-table';
import { Health } from '@app/Common/Health';
import { useApiAlert } from '@app/utils/useApiAlert';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useTranslation } from 'react-i18next';
import {ConsoleServices} from "@services/ConsoleServices";

const ClusterStatus: React.FunctionComponent<any> = (props) => {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
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
    perPage: 10,
  });
  const [rows, setRows] = useState<(string | any)[]>([]);
  const columns = [
    { title: 'Name' },
    {
      title: 'Physical address',
    },
  ];

  useEffect(() => {
    ConsoleServices.dataContainer().getDefaultCacheManager().then((eitherDefaultCm) => {
      setLoading(false);
      if (eitherDefaultCm.isRight()) {
        setCacheManager(eitherDefaultCm.value);
        setFilteredClusterMembers(eitherDefaultCm.value.cluster_members);
        updateRows(eitherDefaultCm.value.cluster_members);
      } else {
        setError(eitherDefaultCm.value.message);
      }
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
  }, [error, cacheManager]);

  const onSetPage = (_event, pageNumber) => {
    setClusterMembersPagination({
      page: pageNumber,
      perPage: clusterMembersPagination.perPage,
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
      perPage: perPage,
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
            No cluster members
          </Title>
          <EmptyStateBody>Add nodes to create a cluster.</EmptyStateBody>
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
              props: { colSpan: 2 },
              title: buildEmptyState(),
            },
          ],
        },
      ];
    } else {
      rows = clusterMembers.map((member) => {
        return {
          heightAuto: true,
          cells: [{ title: member.name }, { title: member.physical_address }],
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
      <Flex id="cluster-status-header" direction={{ default: 'column' }}>
        <Flex>
          <FlexItem>
            <TextContent>
              <Text component={TextVariants.h1}>Cluster membership</Text>
            </TextContent>
          </FlexItem>
        </Flex>
        <Flex>
          <FlexItem>
            <Health health={cacheManager.health} />
          </FlexItem>
          <Divider isVertical></Divider>
          <FlexItem>
            <TextContent>
              <Text component={TextVariants.p}>{sizeLabel}</Text>
            </TextContent>
          </FlexItem>
        </Flex>
      </Flex>
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
            <TableErrorState error={error} />
          </CardBody>
        </Card>
      );
    }

    if (!cacheManager) {
      return (
        <EmptyState variant={EmptyStateVariant.full}>
          <EmptyStateIcon icon={CubesIcon} />
          <EmptyStateBody>This cluster is empty</EmptyStateBody>
        </EmptyState>
      );
    }

    return (
      <Card>
        <CardBody>
          <Pagination
            itemCount={filteredClusterMembers.length}
            perPage={clusterMembersPagination.perPage}
            page={clusterMembersPagination.page}
            onSetPage={onSetPage}
            widgetId="pagination-cluster-members"
            onPerPageSelect={onPerPageSelect}
            isCompact
          />
          <Table
            variant={TableVariant.compact}
            aria-label="Cluster status table"
            cells={columns}
            rows={rows}
          >
            <TableHeader />
            <TableBody />
          </Table>
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
