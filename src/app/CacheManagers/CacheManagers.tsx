import * as React from 'react';
import {useEffect, useState} from 'react';
import dataContainerService from '../../services/dataContainerService'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Label,
  PageSection,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {ClusterIcon} from '@patternfly/react-icons'
import {Link} from "react-router-dom";

const CacheManagers: React.FunctionComponent<any> = (props) => {
  const [cacheManagers, setCacheManagers] = useState<CacheManager[]>([]);
  const [expanded, setExpanded] = useState('');
  useEffect(() => {
    dataContainerService.getCacheManagers()
      .then(cacheManagers => {
        setCacheManagers(cacheManagers);
        setExpanded('toggle-' + cacheManagers[0].name);
      });
  }, []);

  return (
    <PageSection>
      <Accordion asDefinitionList>
        {cacheManagers.map(cm =>
          <AccordionItem>
            <AccordionToggle
              onClick={() => {
                setExpanded('toggle-' + cm.name)
              }}
              isExpanded={expanded === 'toggle-' + cm.name}
              id={'toggle-' + cm.name}>
              {cm.name}
            </AccordionToggle>
            <AccordionContent
              id={'expand-' + cm.name}
              isHidden={expanded !== 'toggle-' + cm.name}
            >
              <Stack gutter="sm">
                <StackItem><ClusterIcon/> {cm.cluster_name} size <b>{cm.cluster_size}</b></StackItem>
                <StackItem>Physical Addresses: <b>{cm.physical_addresses}</b></StackItem>
                <StackItem><Label>{cm.cache_manager_status}</Label></StackItem>
                <StackItem>
                  <Link to={{
                    pathname: '/caches',
                    state: {
                      cacheManager: cm.name,
                      caches: cm.defined_caches
                    }
                  }}>Caches</Link>
                </StackItem>
              </Stack>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </PageSection>
  );
}

export {CacheManagers};
