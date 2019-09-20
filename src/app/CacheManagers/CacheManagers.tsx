import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Label,
  List,
  ListItem,
  PageSection,
} from '@patternfly/react-core';
import {ClusterIcon} from '@patternfly/react-icons'
import {Link} from "react-router-dom";

const CacheManagers: React.FunctionComponent<any> = (props) => {
  const [cacheManagers, setCacheManagers] = useState([]);
  const [expanded, setExpanded] = useState('');
  const [cacheManager, setCacheManager] = useState<ClusterManager | undefined>(undefined);
  const [cacheConfigs, setCacheConfigs] = useState<Array<CacheConfig>>([]);
  const [stats, setStatistics] = useState<CmStats>({statistics_enabled: false});

  useEffect(() => {
    fetch("http://localhost:11222/rest/v2/server/cache-managers/")
      .then(response => response.json())
      .then(data => {
        setCacheManagers(data);
        data.map(cm => {
          setExpanded('toggle-' + cm);
          fetch("http://localhost:11222/rest/v2/cache-managers/" + cm)
            .then(response => response.json())
            .then(data => {
              setCacheManager(data);
            });
          fetch("http://localhost:11222/rest/v2/cache-managers/" + cm + "/cache-configs")
            .then(response => response.json())
            .then(data => {
              setCacheConfigs(data);
            });
          fetch("http://localhost:11222/rest/v2/cache-managers/" + cm + "/stats")
            .then(response => response.json())
            .then(data => {
              setStatistics({statistics_enabled: data.statistics_enabled});
            });
        })
      });
  }, []);

  return (
    <PageSection>
      <Accordion asDefinitionList>
        {cacheManager && cacheManagers.map(cm =>
           <AccordionItem>
            <AccordionToggle
              onClick={() => {
                setExpanded('toggle-' + cm)
              }}
              isExpanded={expanded === 'toggle-' + cm}
              id={'toggle-' + cm}>
              {cm}
            </AccordionToggle>
            <AccordionContent
              id={'expand-' + cm}
              isHidden={expanded !== 'toggle-' + cm}
            >
              <List>
                <ListItem> <ClusterIcon/> {cacheManager.cluster_name} size <b>{cacheManager.cluster_size}</b></ListItem>
                <ListItem>Physical Addresses: <b>{cacheManager.physical_addresses}</b></ListItem>
                <ListItem><Label>{cacheManager.cache_manager_status}</Label></ListItem>
                <ListItem>Statistics enabled: <b>{JSON.stringify(stats.statistics_enabled)}</b></ListItem>
                <ListItem>
                  <Link to={{
                    pathname: '/caches',
                    state: {
                      cacheManager: cm,
                      caches: cacheManager.defined_caches
                    }
                  }}>Caches</Link>
                </ListItem>
              </List>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </PageSection>
  );
}

export {CacheManagers};
