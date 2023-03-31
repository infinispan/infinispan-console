import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Button,
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
  Title
} from '@patternfly/react-core';
import { CubesIcon, SearchIcon, DownloadIcon } from '@patternfly/react-icons';
import { TableComposable, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { Health } from '@app/Common/Health';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useTranslation } from 'react-i18next';
import { useDownloadServerReport, useFetchClusterMembers } from '@app/services/clusterHook';

const ClusterStatus: React.FunctionComponent<any> = (props) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { downloadServerReport, downloading } = useDownloadServerReport();

  const { clusterMembers, cacheManager, loading, error, reload } = useFetchClusterMembers();
  const [filteredClusterMembers, setFilteredClusterMembers] = useState<ClusterMember[]>([]);
  const [clusterMembersPagination, setClusterMembersPagination] = useState({
    page: 1,
    perPage: 10
  });

  const columnNames = {
    name: t('cluster-membership.node-name'),
    physicalAdd: t('cluster-membership.physical-address')
  };

  useEffect(() => {
    if (clusterMembers) {
      const initSlice = (clusterMembersPagination.page - 1) * clusterMembersPagination.perPage;
      setFilteredClusterMembers(clusterMembers.slice(initSlice, initSlice + clusterMembersPagination.perPage));
    }
  }, [loading, clusterMembers, error]);

  useEffect(() => {
    if (filteredClusterMembers) {
      const initSlice = (clusterMembersPagination.page - 1) * clusterMembersPagination.perPage;
      setFilteredClusterMembers(clusterMembers.slice(initSlice, initSlice + clusterMembersPagination.perPage));
    }
  }, [clusterMembersPagination]);

  const onSetPage = (_event, pageNumber) => {
    setClusterMembersPagination({
      ...clusterMembersPagination,
      page: pageNumber
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setClusterMembersPagination({
      page: 1,
      perPage: perPage
    });
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
              <Text component={TextVariants.h1}>{t('cluster-membership.title')}</Text>
            </TextContent>
          </FlexItem>
        </Flex>
        <Flex>
          <FlexItem>
            <Health health={cacheManager.health} />
          </FlexItem>
          <Divider orientation={{ default: 'vertical' }} />
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
          <EmptyStateBody>{t('cluster-membership.empty-cluster')}</EmptyStateBody>
        </EmptyState>
      );
    }

    return (
      <Card>
        <CardBody>
          <Pagination
            itemCount={clusterMembers.length}
            perPage={clusterMembersPagination.perPage}
            page={clusterMembersPagination.page}
            onSetPage={onSetPage}
            widgetId="pagination-cluster-members"
            onPerPageSelect={onPerPageSelect}
            isCompact
          />
          <TableComposable
            className={'cluster-membership-table'}
            aria-label={t('cluster-membership.title')}
            variant={'compact'}
          >
            <Thead>
              <Tr>
                <Th colSpan={1}>{columnNames.name}</Th>
                <Th colSpan={1}>{columnNames.physicalAdd}</Th>
                <Th style={{ width: '28%' }} />
              </Tr>
            </Thead>
            <Tbody>
              {clusterMembers.length == 0 || filteredClusterMembers.length == 0 ? (
                <Tr>
                  <Td colSpan={6}>
                    <Bullseye>
                      <EmptyState variant={EmptyStateVariant.small}>
                        <EmptyStateIcon icon={SearchIcon} />
                        <Title headingLevel="h2" size="lg">
                          {t('cluster-membership.no-cluster-title')}
                        </Title>
                        <EmptyStateBody>{t('cluster-membership.no-cluster-body')}</EmptyStateBody>
                      </EmptyState>
                    </Bullseye>
                  </Td>
                </Tr>
              ) : (
                filteredClusterMembers.map((row) => {
                  return (
                    <Tr key={row.name}>
                      <Td dataLabel={columnNames.name}>{row.name}</Td>
                      <Td dataLabel={columnNames.physicalAdd}>{row.physical_address}</Td>
                      <Td dataLabel={columnNames.physicalAdd}>
                        <Button
                          variant="link"
                          isInline
                          isLoading={downloading}
                          icon={!downloading ? <DownloadIcon /> : null}
                          onClick={() => downloadServerReport(row.name)}
                        >
                          {downloading ? t('cluster-membership.downloading') : t('cluster-membership.download-report')}
                        </Button>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </TableComposable>
        </CardBody>
      </Card>
    );
  };

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>{buildHeader()}</PageSection>
      <PageSection>{buildClusterStatus()}</PageSection>
    </React.Fragment>
  );
};

export { ClusterStatus };
