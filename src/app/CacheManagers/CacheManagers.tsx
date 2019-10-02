import * as React from 'react';
import {useEffect, useState} from 'react';
import dataContainerService from '../../services/dataContainerService'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Button,
  Label,
  PageSection,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {ClusterIcon, MonitoringIcon, VolumeIcon} from '@patternfly/react-icons'
import {Link} from "react-router-dom";
import { CatalogIcon } from '@patternfly/react-icons'

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
                      pathname: 'container/' + cm.name + '/caches/',
                      state: {
                        cacheManager: cm.name
                      }
                    }}><Button variant="link" icon={<VolumeIcon/>}> Caches</Button>{' '}</Link>

                    <Link to={{
                      pathname: 'container/' + cm.name + '/configurations/',
                      state: {
                        cacheManager: cm.name
                      }
                    }}> <Button variant="link" icon={<CatalogIcon/>}>Configurations </Button>{' '}</Link>


                    <Link to={{
                      pathname: 'container/' + cm.name + '/stats/',
                      state: {
                        cacheManager: cm.name
                      }
                    }}><Button variant="link" icon={<MonitoringIcon/>}>Stats </Button>{' '}</Link>


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
