import React from 'react';
import {Divider, FlexItem, Spinner, Switch} from '@patternfly/react-core';
import {useConnectedUser} from "@app/services/userManagementHook";
import {ConsoleServices} from "@services/ConsoleServices";
import {ConsoleACL} from "@services/securityService";
import {useTranslation} from "react-i18next";
import {useApiAlert} from "@app/utils/useApiAlert";
import {useDataContainer} from "@app/services/dataContainerHooks";

const RebalancingCacheManager = () => {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();
  const { connectedUser } = useConnectedUser();
  const { cm, loading, reload } = useDataContainer();

  if (loading || !cm) {
    return (
      <FlexItem>
        <Spinner size={'md'} />
      </FlexItem>
    );
  }

  if (ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser) && cm.rebalancing_enabled != undefined) {
    return (
      <React.Fragment>
        <Divider isVertical />
        <FlexItem>
          <Switch
            label={t('cache-managers.rebalancing-enabled')}
            labelOff={t('cache-managers.rebalancing-disabled')}
            isChecked={cm.rebalancing_enabled}
            onChange={() => {
              ConsoleServices.dataContainer().rebalancing(cm.name, !cm.rebalancing_enabled)
                .then(r => {
                  addAlert(r);
                  reload();
                })
            }}
          />
        </FlexItem>
      </React.Fragment>
    );
  }

  // Return nothing if the connected user is not ADMIN
  return (<FlexItem></FlexItem>);
};

export { RebalancingCacheManager };
