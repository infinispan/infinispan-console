import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Badge,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Level,
  LevelItem,
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
import {Link} from 'react-router-dom';
import {global_spacer_md, global_spacer_xs} from '@patternfly/react-tokens';
import {useApiAlert} from '@app/utils/useApiAlert';
import {DataContainerBreadcrumb} from '@app/Common/DataContainerBreadcrumb';
import crossSiteReplicationService from "../../services/crossSiteReplicationService";
import {cellWidth, IRow, Table, TableBody, TableHeader, TableVariant, textCenter} from "@patternfly/react-table";
import {TableEmptyState} from "@app/Common/TableEmptyState";
import {StateTransfer} from "@app/XSite/StateTransfer";
import {Status} from "@app/Common/Status";
import {InfoCircleIcon} from "@patternfly/react-icons";

interface StateTransferModalState {
  site: string;
  open: boolean;
  action: 'start'| 'cancel' | ''
}

const XSiteCache = props => {
  const { addAlert } = useApiAlert();
  const cacheName =  props.computedMatch.params.cacheName;
  const [backups, setBackups] = useState<XSite[]>([]);
  const [rows, setRows] = useState<IRow[]>([]);
  const [stateTransferStatus, setStateTransferStatus] = useState(new Map());
  const [backupsStatus, setBackupsStatus] = useState(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [stateTransferModal, setStateTransferModal] = useState<StateTransferModalState>({site:'', open: false, action:'' });

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    buildRows();
  }, [backups, backupsStatus, stateTransferStatus]);


  const loadSites = () => {
    // Get backup list
    setLoading(true);
    crossSiteReplicationService.backupsForCache(cacheName).then(eitherResponse => {
      if (eitherResponse.isRight()) {
        setBackups(eitherResponse.value);
        eitherResponse.value.map(xsite =>{
          let latestBackups = new Map();
          crossSiteReplicationService.backupsForSite(cacheName, xsite.name).then(eitherResponse => {
            if(eitherResponse.isRight()) {
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
    });

    // Get state transfer status
    crossSiteReplicationService.stateTransferStatus(cacheName).then(eitherResponse => {
      let latestStStatus = new Map();
      setLoading(false);
      if (eitherResponse.isRight()) {
        eitherResponse.value.map(stStatus => latestStStatus.set(stStatus.site, stStatus.status));
        setStateTransferStatus(latestStStatus);
      } else {
        addAlert(eitherResponse.value);
      }
    })
  }

  const columns = [
    { title: 'Site' , transforms: [cellWidth(20)] },
    { title: 'Status', transforms: [cellWidth(40), textCenter], cellTransforms: [textCenter] },
    { title: 'Transfer status/ Result', transforms: [cellWidth(20), textCenter], cellTransforms: [textCenter] },
    { title: 'Action',  transforms: [cellWidth(10), textCenter], cellTransforms: [textCenter]},
  ];

  const bringOnlineTakeOffLine = (site: string, status: string) => {
      if(status == 'online') {
        crossSiteReplicationService.takeOffline(cacheName, site).then(result => {
          loadSites();
          addAlert(result)
        });
      } if (status == 'offline') {
        crossSiteReplicationService.bringOnline(cacheName, site).then(result => {
          loadSites();
          addAlert(result)
        });
      }
  };

  const clearStateTransfer = (site: string) => {
      crossSiteReplicationService.clearStateTransferState(cacheName, site).then(result => {
        loadSites();
        addAlert(result);
        }
      );
  };

  const buildStatus = (site: string, status: string) => {
    if(site == 'mixed') {
      return (
        <Toolbar key={'mixed-toolbar-' + site}>
        <ToolbarContent>
          <ToolbarItem><Badge><InfoCircleIcon style={{marginRight: global_spacer_xs.value, marginTop: global_spacer_xs.value}}/>Mixed</Badge></ToolbarItem>
          <ToolbarItem>
            <Button variant={ButtonVariant.link} onClick={() => bringOnlineTakeOffLine(site, 'offline')}>Bring all online</Button>
          </ToolbarItem>
          <ToolbarItem variant={ToolbarItemVariant.separator}></ToolbarItem>
          <ToolbarItem>
            <Button variant={ButtonVariant.link}  onClick={() => bringOnlineTakeOffLine(site, 'online')}>Take all offline</Button>
          </ToolbarItem>
        </ToolbarContent>

      </Toolbar>
      )
    }

    return (
     <Switch
      id={site + '-switch'}
      label="Take offline"
      labelOff="Bring online"
      isChecked={status == 'online'}
      onChange={() => bringOnlineTakeOffLine(site, status)}
    />
    );
  };

  const buildStateTransferStatus = (site: string) => {
    if(!stateTransferStatus.has(site)) {
      return '';
    }
    return (
      <Status status={stateTransferStatus.get(site)} />
    );
  };

  const buildStateTransferButton = (backup: XSite) => {
    let stateTransfer = stateTransferStatus.get(backup.name) as string;
    if(stateTransfer == 'SENDING') {
      return (
        <Button variant={ButtonVariant.danger}
                onClick={() => setStateTransferModal({site: backup.name, open: true, action: 'cancel' })}>
          Cancel
        </Button>
      );
    }

    if(stateTransfer == 'OK' || stateTransfer == 'ERROR' || stateTransfer == 'CANCELED') {
      return (
        <Button variant={ButtonVariant.tertiary}
                onClick={() => clearStateTransfer(backup.name)}>
          Clear state
        </Button>
      );
    }

    return (
      <Button variant={ButtonVariant.secondary}
            onClick={() => setStateTransferModal({site: backup.name, open: true, action: 'start' })}>
      Start transfer
    </Button>
    );
  }

  const stateTransfer = (doAction: true) => {
    if(doAction) {
      if(stateTransferModal.action == 'start') {
        crossSiteReplicationService.startStateTransfer(cacheName, stateTransferModal.site).then(result => {
          loadSites();
          addAlert(result);
          });
      } else if (stateTransferModal.action == 'cancel') {
        crossSiteReplicationService.cancelStateTransfer(cacheName, stateTransferModal.site).then(result =>{
          loadSites();
          addAlert(result);
        });
      }
      loadSites();
    }
    setStateTransferModal({site: '', open: false, action: ''});
  }

  const onCollapse = (event, rowKey, isOpen) => {
    rows[rowKey].isOpen = isOpen;
  }

  const buildRows = () => {
    let currentRows;

    if (backups.length == 0) {
      currentRows = [
        {
          heightAuto: true,
          cells: [
            {
              props: {colSpan: 4},
              title: <TableEmptyState loading={loading} error={error} empty={'Sites not found'}/>
            }
          ]
        }
      ];
    }

    currentRows = backups.map(backup =>{
        return  {
          heightAuto: true,
          cells: [
            { title: backup.name },
            { title: buildStatus(backup.name, backup.status) },
            { title: buildStateTransferStatus(backup.name) },
            { title: buildStateTransferButton(backup)}
          ]
        };
    });

    setRows(currentRows);
  };

  return (
  <React.Fragment>
    <PageSection variant={PageSectionVariants.light}>
      <DataContainerBreadcrumb currentPage="Backup management" cacheName={cacheName} />
      <Level>
        <LevelItem>
          <TextContent style={{marginTop: global_spacer_md.value}} key={'title-indexation'}>
            <Text component={TextVariants.h1} key={'title-value-backups'}>Backups management</Text>
          </TextContent>
        </LevelItem>
        <LevelItem>
          <Text key={'button-back'}>
            <Link
              to={{
                pathname: '/cache/' + cacheName
              }}
            >
              <Button variant={ButtonVariant.secondary}>Back</Button>
            </Link>
          </Text>
        </LevelItem>
      </Level>
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
    <StateTransfer cacheName={cacheName}
                   action={stateTransferModal.action}
                   siteName={stateTransferModal.site}
                   isModalOpen={stateTransferModal.open}
                   closeModal={stateTransfer}/>
  </React.Fragment>
  );
};
export { XSiteCache };
