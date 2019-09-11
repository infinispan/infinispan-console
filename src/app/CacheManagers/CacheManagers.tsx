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
import {Caches} from "@app/Caches/Caches";
import {Link} from "react-router-dom";

const CacheManagers: React.FunctionComponent<any> = (props) => {
  const [cacheManagers, setCacheManagers] = useState([]);
  const [cacheManager, setCacheManager] = useState<ClusterManager | undefined>(undefined);
  useEffect(() => {
    fetch("http://localhost:11222/rest/v2/server/cache-managers/")
      .then(response => response.json())
      .then(data => {
        setCacheManagers(data);
        data.map(cm => {
          fetch("http://localhost:11222/rest/v2/cache-managers/" + cm)
            .then(response => response.json())
            .then(data => {
              setCacheManager(data)
            });
        })
      });
  }, []);
  const [expanded, setExpanded] = useState('');
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
                <ListItem> <ClusterIcon/> {cacheManager.cluster_name}</ListItem>
                <ListItem>Cluster size {cacheManager.cluster_size}</ListItem>
                <ListItem>Physical Addresses {cacheManager.physical_addresses}</ListItem>
                <ListItem><Label>{cacheManager.cache_manager_status}</Label></ListItem>
                <ListItem>
                  <Link to='caches'>pepe</Link>
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
