import React from 'react';
import {
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
  Stack,
  StackItem
} from "@patternfly/react-core";
import {ClusterIcon, CubesIcon} from "@patternfly/react-icons";
import displayUtils from "../../services/displayUtils";

const ClusterDisplay = (props: { cacheManager: (undefined | CacheManager) }) => {
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
  let size = cm.cluster_size > 1 ? cm.cluster_size + ' members' : cm.cluster_size + ' member';
  return (
    <Card style={{marginTop: 40}}>
      <CardBody>
        <Grid gutter="md">
          <GridItem span={2}>
            <Stack>
              <StackItem><ClusterIcon size={"xl"} style={{marginLeft: 14, marginBottom: 10}}/></StackItem>
              <StackItem><Label
                style={{backgroundColor: displayUtils.healthColor(cm.health)}}>{cm.health}</Label></StackItem>
            </Stack>
          </GridItem>
          <GridItem span={4}>
            <Stack>
              <StackItem><h1 style={{fontSize: 22}}>{cm.cluster_name}</h1></StackItem>
              <StackItem> {size}</StackItem>
            </Stack>
          </GridItem>
          <GridItem span={6}>
            <Gallery>
              {cm.cluster_members.map((mem, index) =>
                <GalleryItem>
                  <Stack>
                    <StackItem><strong>{mem}</strong></StackItem>
                    <StackItem>{cm.cluster_members_physical_addresses[index]}</StackItem>
                  </Stack>
                </GalleryItem>)}
            </Gallery>
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  );
};

export {ClusterDisplay};
