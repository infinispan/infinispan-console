import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Badge,
  Bullseye,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  PageSection,
  PageSectionVariants,
  Switch,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarItemVariant
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { global_spacer_xs } from '@patternfly/react-tokens';
import { useApiAlert } from '@app/utils/useApiAlert';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import { cellWidth, IRow, TableVariant, textCenter } from '@patternfly/react-table';
import { Table, TableBody, TableHeader } from '@patternfly/react-table/deprecated';
import { TableEmptyState } from '@app/Common/TableEmptyState';
import { StateTransfer } from '@app/XSite/StateTransfer';
import { Status } from '@app/Common/Status';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ST_IDLE, ST_SEND_CANCELED, ST_SEND_FAILED, ST_SEND_OK, ST_SENDING } from '@services/displayUtils';

interface StateTransferModalState {
  site: string;
  open: boolean;
  action: 'start' | 'cancel' | '';
}

const XSiteCache = (props) => {
  const { t } = useTranslation();
  const crossSiteReplicationService = ConsoleServices.xsite();
  const brandname = t('brandname.brandname');
  const { addAlert } = useApiAlert();
  const cacheName = decodeURIComponent(props.computedMatch.params.cacheName);
  const { connectedUser } = useConnectedUser();
  const [backups, setBackups] = useState<XSite[]>([]);
  const [rows, setRows] = useState<IRow[]>([]);
  const [stateTransferStatus, setStateTransferStatus] = useState(new Map<string, Status>());
  const [backupsStatus, setBackupsStatus] = useState(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [stateTransferModal, setStateTransferModal] = useState<StateTransferModalState>({
    site: '',
    open: false,
    action: ''
  });

  useEffect(() => {
    if (loading) {
      // Load Sites
      // First check ADMIN
      if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
        setLoading(false);
        setError('Connected user lacks ADMIN permission.');
        return;
      }
      // Second get backups
      crossSiteReplicationService
        .backupsForCache(cacheName)
        .then((eitherResponse) => {
          if (eitherResponse.isRight()) {
            setBackups(eitherResponse.value);
            eitherResponse.value.map((xsite) => {
              const latestBackups = new Map();
              crossSiteReplicationService.backupsForSite(cacheName, xsite.name).then((eitherResponse) => {
                if (eitherResponse.isRight()) {
                  latestBackups.set(xsite.name, eitherResponse.value);
                  setBackupsStatus(latestBackups);
                } else {
                  addAlert(eitherResponse.value);
                }
              });
            });
          } else {
            setError(eitherResponse.value.message);
            addAlert(eitherResponse.value);
          }
        })
        .then(() => {
          // Third get state transfer status
          crossSiteReplicationService
            .stateTransferStatus(cacheName)
            .then((eitherResponse) => {
              const latestStStatus = new Map();
              if (eitherResponse.isRight()) {
                eitherResponse.value.map((stStatus) => latestStStatus.set(stStatus.site, stStatus.status));
                setStateTransferStatus(latestStStatus);
              } else {
                addAlert(eitherResponse.value);
              }
            })
            .then(() => setLoading(false));
        });
    }
  }, [loading]);

  useEffect(() => {
    buildRows();
  }, [backups, backupsStatus, stateTransferStatus, loading, error]);

  const columns = [
    { title: t('caches.backups.column-site'), transforms: [cellWidth(30)] },
    {
      title: t('caches.backups.column-status'),
      transforms: [cellWidth(30), textCenter],
      cellTransforms: [textCenter]
    },
    {
      title: t('caches.backups.column-transfer'),
      transforms: [cellWidth(40), textCenter],
      cellTransforms: [textCenter]
    },
    {
      title: t('caches.backups.column-action'),
      transforms: [cellWidth(20), textCenter],
      cellTransforms: [textCenter]
    }
  ];

  const bringOnlineTakeOffLine = (site: string, status: string) => {
    if (status == 'online') {
      crossSiteReplicationService
        .takeOffline(cacheName, site)
        .then((result) => {
          addAlert(result);
        })
        .finally(() => setLoading(true));
    }
    if (status == 'offline') {
      crossSiteReplicationService
        .bringOnline(cacheName, site)
        .then((result) => {
          addAlert(result);
        })
        .finally(() => setLoading(true));
    }
  };

  const clearStateTransfer = (site: string) => {
    crossSiteReplicationService
      .clearStateTransferState(cacheName, site)
      .then((result) => {
        addAlert(result);
      })
      .finally(() => setLoading(true));
  };

  const buildStatus = (site: string, status: string) => {
    if (site == 'mixed') {
      return (
        <Toolbar key={'mixed-toolbar-' + site}>
          <ToolbarContent>
            <ToolbarItem>
              <Badge>
                <InfoCircleIcon
                  style={{
                    marginRight: global_spacer_xs.value,
                    marginTop: global_spacer_xs.value
                  }}
                />
                {t('caches.backups.mixed')}
              </Badge>
            </ToolbarItem>
            <ToolbarItem>
              <Button variant={ButtonVariant.link} onClick={() => bringOnlineTakeOffLine(site, 'offline')}>
                {t('caches.backups.bring-all-online')}
              </Button>
            </ToolbarItem>
            <ToolbarItem variant={ToolbarItemVariant.separator}></ToolbarItem>
            <ToolbarItem>
              <Button variant={ButtonVariant.link} onClick={() => bringOnlineTakeOffLine(site, 'online')}>
                {t('caches.backups.take-all-offline')}
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      );
    }

    return (
      <Switch
        id={site + '-switch'}
        label={t('caches.backups.take-offline-action')}
        labelOff={t('caches.backups.bring-online-action')}
        isChecked={status == 'online'}
        onChange={() => bringOnlineTakeOffLine(site, status)}
      />
    );
  };

  const buildStateTransferStatus = (site: string) => {
    const stStatus = stateTransferStatus.get(site);
    if (!stStatus || stStatus == ST_IDLE) {
      return '';
    }
    return (
      <Bullseye>
        <Status status={stateTransferStatus.get(site)} />
      </Bullseye>
    );
  };

  const buildStateTransferButton = (backup: XSite) => {
    const maybeSTStatus = stateTransferStatus.get(backup.name);
    const stStatus = maybeSTStatus != undefined ? maybeSTStatus : ST_IDLE;

    if (stStatus == ST_SENDING) {
      return (
        <Button
          variant={ButtonVariant.danger}
          onClick={() =>
            setStateTransferModal({
              site: backup.name,
              open: true,
              action: 'cancel'
            })
          }
        >
          {t('common.actions.cancel')}
        </Button>
      );
    }

    if (stStatus == ST_SEND_OK || stStatus == ST_SEND_FAILED || stStatus == ST_SEND_CANCELED) {
      return (
        <Button variant={ButtonVariant.tertiary} onClick={() => clearStateTransfer(backup.name)}>
          {t('caches.backups.clear-state-action')}
        </Button>
      );
    }

    return (
      <Button
        variant={ButtonVariant.secondary}
        onClick={() =>
          setStateTransferModal({
            site: backup.name,
            open: true,
            action: 'start'
          })
        }
      >
        Start transfer
      </Button>
    );
  };

  const stateTransfer = (doAction: true) => {
    if (doAction) {
      if (stateTransferModal.action == 'start') {
        crossSiteReplicationService
          .startStateTransfer(cacheName, stateTransferModal.site)
          .then((result) => {
            addAlert(result);
          })
          .finally(() => setLoading(true));
      } else if (stateTransferModal.action == 'cancel') {
        crossSiteReplicationService
          .cancelStateTransfer(cacheName, stateTransferModal.site)
          .then((result) => {
            addAlert(result);
          })
          .finally(() => setLoading(true));
      } else {
        setLoading(true);
      }
    }
    setStateTransferModal({ site: '', open: false, action: '' });
  };

  const onCollapse = (event, rowKey, isOpen) => {
    rows[rowKey].isOpen = isOpen;
  };

  const buildRows = () => {
    let currentRows;

    if (loading || error) {
      currentRows = [
        {
          heightAuto: true,
          cells: [
            {
              props: { colSpan: 4 },
              title: <TableEmptyState loading={loading} error={error} empty={'Sites not found'} />
            }
          ]
        }
      ];
    } else {
      currentRows = backups.map((backup) => {
        return {
          heightAuto: true,
          cells: [
            { title: backup.name },
            { title: buildStatus(backup.name, backup.status) },
            { title: buildStateTransferStatus(backup.name) },
            { title: buildStateTransferButton(backup) }
          ]
        };
      });
    }
    setRows(currentRows);
  };

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <DataContainerBreadcrumb currentPage={t('caches.backups.title')} cacheName={cacheName} />
        <Toolbar key={'title-backups'}>
          <ToolbarContent>
            <ToolbarItem>
              <TextContent key={'title-backups'}>
                <Text component={TextVariants.h1} key={'title-value-backups'}>
                  {t('caches.backups.title')}
                </Text>
              </TextContent>
            </ToolbarItem>
            <ToolbarItem>
              <Text key={'button-back'}>
                <Link
                  to={{
                    pathname: '/cache/' + encodeURIComponent(cacheName),
                    search: location.search
                  }}
                >
                  <Button variant={ButtonVariant.secondary} data-cy="backButton">
                    {t('common.actions.back')}
                  </Button>
                </Link>
              </Text>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </PageSection>
      <PageSection>
        <Card>
          <CardBody>
            <Table
              aria-label="XSite Table"
              cells={columns}
              rows={rows}
              variant={TableVariant.compact}
              onCollapse={onCollapse}
            >
              <TableHeader />
              <TableBody />
            </Table>
          </CardBody>
        </Card>
      </PageSection>
      <StateTransfer
        cacheName={cacheName}
        action={stateTransferModal.action}
        siteName={stateTransferModal.site}
        isModalOpen={stateTransferModal.open}
        closeModal={stateTransfer}
      />
    </React.Fragment>
  );
};
export { XSiteCache };
