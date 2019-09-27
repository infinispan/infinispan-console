import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import {Link, Switch} from "react-router-dom";
import cacheService from "../../services/cacheService";

const Caches: React.FunctionComponent<any> = (props) => {
  const cm = props.location.state.cacheManager;
  const cacheNames = props.location.state.caches;
  const [caches, setCaches] = useState<InfinispanCache[]>([]);
  useEffect(() => {
    Promise.all(cacheNames
      .map(cacheName => cacheService.retrieveCacheDetail(cacheName.name, cacheName.started)))
    // @ts-ignore
      .then(result => setCaches(result));
  }, []);

  return (
    <PageSection>
      <Stack gutter="lg">
        <StackItem><Title id='caches-title' size="lg"><b>{cm}</b></Title></StackItem>
        <StackItem>
          <Grid>
            {caches.map(cache =>
              <GridItem id={'id-grid-item' + cache.name} span={3}>
                <Card id={'id-card' + cache.name}>
                  <CardHeader id={'id-card-header' + cache.name}>{cache.name}</CardHeader>
                  <CardBody id={'id-card-body' + cache.name}>
                    <Stack gutter="sm">
                      <StackItem><Badge>{cache.type}</Badge></StackItem>
                      <StackItem isFilled>Size {cache.size}</StackItem>
                      <StackItem>
                        <Link to={{
                          pathname: '/cache/'+ cache.name
                        }}>Details</Link></StackItem>
                    </Stack>
                  </CardBody>
                </Card>
              </GridItem>
            )}
             {/* <GridItem id={'id-grid-item-empty'} span={12}>
                No caches to be displayed
              </GridItem>*/}
          </Grid>
        </StackItem>
        <StackItem>
          <Link to={{
            pathname: '/caches/create',
            state: {
              cacheManager: cm,
            }
          }}>Create Cache</Link>
        </StackItem>
      </Stack>
    </PageSection>
  );
}
export {Caches};
