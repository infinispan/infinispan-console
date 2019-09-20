import * as React from 'react';
import {useEffect, useState} from 'react';
import {Badge, Card, CardBody, CardHeader, Grid, GridItem, PageSection, Title,} from '@patternfly/react-core';
import {Link} from "react-router-dom";

const Caches: React.FunctionComponent<any> = (props) => {
  const cm = props.location.state.cacheManager;
  const cacheNames = props.location.state.caches;
  const [caches, setCaches] = useState<InfinispanCache[]>([]);

  useEffect(() => {
    cacheNames.map(cacheName => {
      fetch("http://localhost:11222/rest/v2/caches/" + cacheName.name + "/?action=size")
        .then(response => response.json())
        .then(size => {
           fetch("http://localhost:11222/rest/v2/caches/" + cacheName.name + "/?action=config")
            .then(response => response.json())
            .then(config => {
              let cacheType:string = 'unknown';
              if(config.hasOwnProperty('distributed-cache')) {
                cacheType = 'distributed';
              } else if(config.hasOwnProperty('replicated-cache')) {
                cacheType = 'replicated';
              }
              let cache: InfinispanCache = {name: cacheName.name,
                started: cacheName.started,
                size: size,
                type: cacheType};
              return cache;
            }).then(cache => {
             setCaches(prev => prev.concat(cache));
           });
        });
    });
  }, []);

  return (
    <PageSection>
      <Title id='caches-title' size="lg"><b>{cm}</b> Caches </Title>
      <Grid>
        {caches.map(cache =>
          <GridItem id={'id-grid-item' + cache.name} span={6}>
            <Card id={'id-card' + cache.name}>
              <CardHeader id={'id-card-header' + cache.name}>{cache.name}</CardHeader>
              <CardBody id={'id-card-body' + cache.name}>
                <Badge>{cache.type} ({cache.size})</Badge>
                <Link to={{
                  pathname: '/caches/detail',
                  state: {
                    cacheName: cache.name,
                  }}}>More</Link>
              </CardBody>
            </Card>
          </GridItem>
        )}

      </Grid>
      <Link to={{
        pathname: '/caches/create',
        state: {
          cacheManager: cm,
        }
      }}>Create Cache</Link>

    </PageSection>
  );
}
export {Caches};
