import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import {Link} from "react-router-dom";
import cacheService from "../../services/cacheService";
import {CubesIcon, PlusCircleIcon} from "@patternfly/react-icons";

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

  function EmptyCaches() {
    return <EmptyState variant={EmptyStateVariant.small}>
      <EmptyStateIcon icon={CubesIcon}/>
      <Title headingLevel="h5" size="lg">
        Empty
      </Title>
      <EmptyStateBody>
        There are no caches with those filters
      </EmptyStateBody>
      <Link to={{
        pathname: '/caches/create',
        state: {
          cacheManager: cm,
        }
      }}>
        <Button component="a" target="_blank" variant="primary">
          Create cache
        </Button>
      </Link>
    </EmptyState>
  }

  function DisplayCaches() {
    return <Grid>
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
                    pathname: '/cache/' + cache.name
                  }}>Details</Link></StackItem>
              </Stack>
            </CardBody>
          </Card>
        </GridItem>
      )}
    </Grid>
  }

  function CachesContent() {
    const isEmpty = caches.length == 0;
    if (isEmpty) {
      return <EmptyCaches/>;
    }
    return <DisplayCaches/>;
  }

  return (
    <PageSection>
      <Stack gutter="lg">
        <StackItem><Title id='caches-title' size="lg"><b>{cm}</b></Title></StackItem>
        <StackItem>
          <Link to={{
            pathname: '/caches/create',
            state: {
              cacheManager: cm,
            }
          }}>
            <Button component="a" target="_blank" variant="link" icon={<PlusCircleIcon />}>
              Create cache
            </Button>
          </Link>
        </StackItem>
        <StackItem>
          <CachesContent/>
        </StackItem>
      </Stack>
    </PageSection>
  );
}
export {Caches};
