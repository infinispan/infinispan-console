import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Bullseye,
  Button,
  Card,
  CardBody,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  PageSection,
  Pagination,
  SearchInput,
  Spinner,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { CubesIcon, DownloadIcon, SearchIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useTranslation } from 'react-i18next';
import { useDownloadServerReport, useFetchClusterMembers } from '@app/services/clusterHook';
import { t_global_spacer_md } from '@patternfly/react-tokens';
import { onSearch } from '@app/utils/searchFilter';
import { InfinispanComponentStatus } from '@app/Common/InfinispanComponentStatus';
import displayUtils from '@services/displayUtils';
import { useLocalStorage } from '@app/utils/localStorage';

const ClusterMembership = () => {
  const { t } = useTranslation();
  const { downloadServerReport, downloading, downloadNodeName } = useDownloadServerReport();
  const { clusterMembers, loading, error } = useFetchClusterMembers();
  const [filteredClusterMembers, setFilteredClusterMembers] = useState<ClusterMember[]>([]);
  const [clusterMembersPagination, setClusterMembersPagination] = useLocalStorage('cluster-members-table', {
    page: 1,
    perPage: 10
  });
  const [searchValue, setSearchValue] = useState<string>('');
  const [rows, setRows] = useState<ClusterMember[]>([]);

  const columnNames = {
    name: t('cluster-membership.node-name'),
    status: t('cluster-membership.status'),
    version: t('cluster-membership.version'),
    physicalAdd: t('cluster-membership.physical-address')
  };

  useEffect(() => {
    if (clusterMembers) setFilteredClusterMembers(clusterMembers.members);
  }, [clusterMembers, error, loading]);

  useEffect(() => {
    if (filteredClusterMembers) {
      const initSlice = (clusterMembersPagination.page - 1) * clusterMembersPagination.perPage;
      const updateRows = filteredClusterMembers.slice(initSlice, initSlice + clusterMembersPagination.perPage);
      setRows(updateRows);
    }
  }, [clusterMembersPagination, filteredClusterMembers]);

  useEffect(() => {
    if (clusterMembers) {
      setFilteredClusterMembers(clusterMembers.members.filter((data) => onSearch(searchValue, data.node_address)));
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
    if (!clusterMembers) {
      return <Content component={ContentVariants.h1}>-</Content>;
    }

    const member = clusterMembers.members.length > 1 ? ' members ' : ' member ';
    const sizeLabel = clusterMembers.members.length + member + 'in use';

    return (
      <React.Fragment>
        <Toolbar id="cluster-status-header">
          <ToolbarContent>
            <ToolbarItem>
              <Title headingLevel={'h1'}>{t('cluster-membership.title')}</Title>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Toolbar id="cluster-status-info">
          <ToolbarContent>
            <ToolbarItem>
              <Content component={ContentVariants.p}>{sizeLabel}</Content>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </React.Fragment>
    );
  };

  const searchInput = (
    <SearchInput
      placeholder={t('cluster-membership.node-search')}
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

    if (!clusterMembers) {
      return (
        <EmptyState variant={EmptyStateVariant.full} icon={CubesIcon}>
          <EmptyStateBody>{t('cluster-membership.empty-cluster')}</EmptyStateBody>
        </EmptyState>
      );
    }

    return (
      <>
        <Toolbar id="cluster-table-toolbar" style={{ marginBottom: t_global_spacer_md.value }}>
          <ToolbarContent>
            <ToolbarItem>{searchInput}</ToolbarItem>
            <ToolbarItem variant="pagination">{toolbarPagination('down')}</ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table className={'cluster-membership-table'} aria-label={t('cluster-membership.title')} variant={'compact'}>
          <Thead>
            <Tr>
              <Th colSpan={1}>{columnNames.name}</Th>
              <Th colSpan={1}>{columnNames.status}</Th>
              <Th colSpan={1}>{columnNames.version}</Th>
              <Th colSpan={1}>{columnNames.physicalAdd}</Th>
              <Th style={{ width: '28%' }} screenReaderText="Download server report buttons" />
            </Tr>
          </Thead>
          <Tbody>
            {filteredClusterMembers.length == 0 ? (
              <Tr>
                <Td colSpan={6}>
                  <Bullseye>
                    <EmptyState
                      variant={EmptyStateVariant.sm}
                      titleText={<>{t('cluster-membership.no-cluster-title')}</>}
                      icon={SearchIcon}
                      headingLevel="h2"
                    >
                      <EmptyStateBody>{t('cluster-membership.no-cluster-body')}</EmptyStateBody>
                    </EmptyState>
                  </Bullseye>
                </Td>
              </Tr>
            ) : (
              rows.map((row) => {
                const isDownloading = downloading && downloadNodeName === row.node_address;
                return (
                  <Tr key={row.node_address}>
                    <Td dataLabel={columnNames.name}>{row.node_address}</Td>
                    <Td dataLabel={columnNames.status}>
                      {
                        <InfinispanComponentStatus
                          status={displayUtils.parseComponentStatus(row.cache_manager_status)}
                        />
                      }
                    </Td>
                    <Td dataLabel={columnNames.version}>{row.version}</Td>
                    <Td dataLabel={columnNames.physicalAdd}>{row.physical_addresses}</Td>
                    <Td dataLabel={columnNames.physicalAdd}>
                      <Button
                        data-cy="downloadReportLink"
                        variant="link"
                        isInline
                        isLoading={isDownloading}
                        icon={!isDownloading ? <DownloadIcon /> : null}
                        onClick={() => downloadServerReport(row.node_address)}
                      >
                        {isDownloading ? t('cluster-membership.downloading') : t('cluster-membership.download-report')}
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
      </>
    );
  };

  return (
    <React.Fragment>
      <PageSection>{buildHeader()}</PageSection>
      <PageSection>{buildClusterStatus()}</PageSection>
    </React.Fragment>
  );
};

export { ClusterMembership };
