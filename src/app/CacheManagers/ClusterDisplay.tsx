import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Label,
  Stack,
  StackItem
} from "@patternfly/react-core";
import {ClusterIcon, CubesIcon} from "@patternfly/react-icons";
import displayUtils from "../../services/displayUtils";

const ClusterDisplay = (props: { cacheManager: (undefined |CacheManager) }) => {
  const cm: (undefined | CacheManager) = props.cacheManager;

  if (!cm) {
    return (
      <EmptyState variant={EmptyStateVariant.full}>
        <EmptyStateIcon icon={CubesIcon}/>
        <EmptyStateBody>
          The cluster is empty
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <Card style={{marginTop: 40}}>
      <CardHeader><ClusterIcon/> <strong>{' ' + cm.cluster_name}</strong></CardHeader>
      <CardBody>
        <Stack gutter="md">
          <StackItem><Label
            style={{backgroundColor: displayUtils.healthColor(cm.health)}}>{cm.health}</Label></StackItem>
          <StackItem>Size <strong>{cm.cluster_size}</strong></StackItem>
          <StackItem><strong>{cm.cluster_members.map(mem => <span key={mem}
                                                                        style={{marginRight: 10}}>[{mem}]</span>)}</strong></StackItem>
          <StackItem><strong>{cm.cluster_members_physical_addresses.map(add => <span key={add}
                                                                                           style={{marginRight: 10}}>[{add}]</span>)}</strong></StackItem>
        </Stack>
      </CardBody>
    </Card>
  );
};

export {ClusterDisplay};
