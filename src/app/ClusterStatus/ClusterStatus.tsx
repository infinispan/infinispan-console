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
  SearchInput,
  Spinner,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  EmptyStateHeader
} from '@patternfly/react-core';
import { CubesIcon, SearchIcon, DownloadIcon } from '@patternfly/react-icons';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { Health } from '@app/Common/Health';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useTranslation } from 'react-i18next';
import { useDownloadServerReport, useFetchClusterMembers } from '@app/services/clusterHook';
import { global_spacer_md } from '@patternfly/react-tokens';
import { onSearch } from '@app/utils/searchFilter';

const ClusterStatus = (props) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { downloadServerReport, downloading, downloadNodeName } = useDownloadServerReport();

  const { clusterMembers, cacheManager, loading, error, reload } = useFetchClusterMembers();
  const [filteredClusterMembers, setFilteredClusterMembers] = useState<ClusterMember[]>([]);
  const [clusterMembersPagination, setClusterMembersPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [searchValue, setSearchValue] = useState<string>('');
  const [rows, setRows] = useState<ClusterMember[]>([]);

  const columnNames = {
    name: t('cluster-membership.node-name'),
    physicalAdd: t('cluster-membership.physical-address')
  };

  useEffect(() => {
    if (clusterMembers) setFilteredClusterMembers(clusterMembers);
  }, [clusterMembers, error, loading]);

  useEffect(() => {
    if (filteredClusterMembers) {
      const initSlice = (clusterMembersPagination.page - 1) * clusterMembersPagination.perPage;
      const updateRows = filteredClusterMembers.slice(initSlice, initSlice + clusterMembersPagination.perPage);
      updateRows.length > 0 ? setRows(updateRows) : setRows([]);
    }
  }, [clusterMembersPagination, filteredClusterMembers]);

  useEffect(() => {
    if (clusterMembers) {
      setFilteredClusterMembers(clusterMembers.filter((data) => onSearch(searchValue, data.name)));
      onSetPage(1);
    }
  }, [searchValue, clusterMembers]);

  const onSetPage = (pageNumber) => {
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

  const searchInput = (
    <SearchInput
      placeholder={t('cache-managers.cache-search')}
      value={searchValue}
      onChange={(_event, val) => setSearchValue(val)}
      onClear={() => setSearchValue('')}
    />
  );

  const toolbarPagination = (dropDirection) => {
    return (
      <Pagination
        data-cy="paginationArea"
        itemCount={filteredClusterMembers.length}
        perPage={clusterMembersPagination.perPage}
        page={clusterMembersPagination.page}
        onSetPage={(_event, pageNumber) => onSetPage(pageNumber)}
        widgetId="pagination-cluster-members"
        onPerPageSelect={onPerPageSelect}
        isCompact
        dropDirection={dropDirection}
      />
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
          <EmptyStateHeader icon={<EmptyStateIcon icon={CubesIcon} />} />
          <EmptyStateBody>{t('cluster-membership.empty-cluster')}</EmptyStateBody>
        </EmptyState>
      );
    }

    return (
      <Card>
        <CardBody>
          <Toolbar id="cluster-table-toolbar" style={{ marginBottom: global_spacer_md.value }}>
            <ToolbarContent>
              <ToolbarItem variant="search-filter">{searchInput}</ToolbarItem>
              <ToolbarItem variant="pagination">{toolbarPagination('down')}</ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          <Table className={'cluster-membership-table'} aria-label={t('cluster-membership.title')} variant={'compact'}>
            <Thead>
              <Tr>
                <Th colSpan={1}>{columnNames.name}</Th>
                <Th colSpan={1}>{columnNames.physicalAdd}</Th>
                <Th style={{ width: '28%' }} />
              </Tr>
            </Thead>
            <Tbody>
              {filteredClusterMembers.length == 0 ? (
                <Tr>
                  <Td colSpan={6}>
                    <Bullseye>
                      <EmptyState variant={EmptyStateVariant.sm}>
                        <EmptyStateHeader
                          titleText={<>{t('cluster-membership.no-cluster-title')}</>}
                          icon={<EmptyStateIcon icon={SearchIcon} />}
                          headingLevel="h2"
                        />
                        <EmptyStateBody>{t('cluster-membership.no-cluster-body')}</EmptyStateBody>
                      </EmptyState>
                    </Bullseye>
                  </Td>
                </Tr>
              ) : (
                rows.map((row) => {
                  const isDownloading = downloading && downloadNodeName === row.name;
                  return (
                    <Tr key={row.name}>
                      <Td dataLabel={columnNames.name}>{row.name}</Td>
                      <Td dataLabel={columnNames.physicalAdd}>{row.physical_address}</Td>
                      <Td dataLabel={columnNames.physicalAdd}>
                        <Button
                          variant="link"
                          isInline
                          isLoading={isDownloading}
                          icon={!isDownloading ? <DownloadIcon /> : null}
                          onClick={() => downloadServerReport(row.name)}
                        >
                          {isDownloading
                            ? t('cluster-membership.downloading')
                            : t('cluster-membership.download-report')}
                        </Button>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
          <Toolbar id="cluster-membership-table-toolbar" className={'cluster-membership-table-display'}>
            <ToolbarItem variant="pagination">{toolbarPagination('up')}</ToolbarItem>
          </Toolbar>
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
