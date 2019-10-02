import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  PageSection,
  Text,
  TextContent,
  TextVariants,
  Title
} from '@patternfly/react-core';
import dataContainerService from "../../services/dataContainerService";

const DetailConfigurations: React.FunctionComponent<any> = (props) => {
  const cm: string = props.location.state.cacheManager;
  const [configs, setConfigs] = useState<CacheConfig[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    dataContainerService.getCacheManagerConfigurations(cm)
      .then(detailedStats => {
        setConfigs(detailedStats);
      });
  }, []);

  const toggle = id => {
    const index = expanded.indexOf(id);
    const newExpanded =
      index >= 0 ? [...expanded.slice(0, index), ...expanded.slice(index + 1, expanded.length)] : [...expanded, id];
    setExpanded(newExpanded);
  };


  return (
    <PageSection>
      <Title size="lg"> Configurations <strong>{cm}</strong> cache manager</Title>
      <Accordion asDefinitionList={false}>
        {configs.map(config =>
          <AccordionItem>
            <AccordionToggle
              onClick={() => toggle(config.name + '-toggle')}
              isExpanded={expanded.includes(config.name + '-toggle')}
              id="ex2-toggle1"
            >
              {config.name}
            </AccordionToggle>
            <AccordionContent
              id="ex2-expand1"
              isHidden={!expanded.includes(config.name + '-toggle')}
              isFixed
            >
              <TextContent>
                <Text component={TextVariants.p}>
                  <pre id={config.name + '-json'}>{config.config}</pre>
                </Text>
              </TextContent>
            </AccordionContent>
          </AccordionItem>
        )}

      </Accordion>
    </PageSection>
  );
}
export {DetailConfigurations};
