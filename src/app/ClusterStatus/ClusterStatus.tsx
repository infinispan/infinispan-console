import * as React from 'react';
import { useEffect, useState } from 'react';
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
  PageSection,
  Stack,
  StackItem
} from '@patternfly/react-core';
import { ClusterIcon, CubesIcon } from '@patternfly/react-icons';
import dataContainerService from '../../services/dataContainerService';
import displayUtils from '../../services/displayUtils';

const ClusterStatus: React.FunctionComponent<any> = props => {
  const [cacheManager, setCacheManager] = useState<undefined | CacheManager>(
    undefined
  );
  useEffect(() => {
    dataContainerService.getCacheManagers().then(cacheManagers => {
      if (cacheManagers.length > 0) {
        setCacheManager(cacheManagers[0]);
      }
    });
  }, []);

  const DisplayClusterStatus = () => {
    if (!cacheManager) {
      return (
        <EmptyState variant={EmptyStateVariant.full}>
          <EmptyStateIcon icon={CubesIcon} />
          <EmptyStateBody>The cluster is empty</EmptyStateBody>
        </EmptyState>
      );
    }
    let size =
      cacheManager.cluster_size > 1
        ? cacheManager.cluster_size + ' members'
        : cacheManager.cluster_size + ' member';
    return (
      <Card style={{ marginTop: 40 }}>
        <CardBody>
          <Grid>
            <GridItem span={2}>
              <Stack>
                <StackItem>
                  <ClusterIcon
                    size={'xl'}
                    style={{ marginLeft: 14, marginBottom: 10 }}
                  />
                </StackItem>
                <StackItem>
                  <Label
                    style={{
                      backgroundColor: displayUtils.healthColor(
                        cacheManager.health
                      )
                    }}
                  >
                    {cacheManager.health}
                  </Label>
                </StackItem>
              </Stack>
            </GridItem>
            <GridItem span={2}>
              <Stack>
                <StackItem>
                  <h1 style={{ fontSize: 22 }}>{cacheManager.cluster_name}</h1>
                </StackItem>
                <StackItem> {size}</StackItem>
              </Stack>
            </GridItem>
            <GridItem span={8}>
              <Gallery>
                {cacheManager.cluster_members.map((mem, index) => (
                  <GalleryItem>
                    <Stack>
                      <StackItem>
                        <strong>{mem}</strong>
                      </StackItem>
                      <StackItem>
                        {cacheManager.cluster_members_physical_addresses[index]}
                      </StackItem>
                    </Stack>
                  </GalleryItem>
                ))}
              </Gallery>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
    );
  };

  return (
    <PageSection>
      <DisplayClusterStatus />
    </PageSection>
  );
};

export { ClusterStatus };
