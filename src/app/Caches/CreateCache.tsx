import * as React from 'react';
import {useEffect, useState} from 'react';
import {
  ActionGroup,
  Button,
  Expandable,
  Form,
  FormGroup,
  PageSection,
  Select,
  SelectOption,
  SelectVariant,
  TextArea,
  TextInput,
  Title,
} from '@patternfly/react-core';
import {CubeIcon} from "@patternfly/react-icons";
import cacheService from "../../services/cacheService";

const CreateCache: React.FunctionComponent<any> = (props) => {
  const cm = props.location.state.cacheManager;
  const [cacheName, setCacheName] = useState('');
  const [config, setConfig] = useState('');
  const [configs, setConfigs] = useState<OptionSelect[]>([]);
  const [expandedSelect, setExpandedSelect] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<null | string>(null);
  const [configExpanded, setConfigExpanded] = useState(false);

  interface OptionSelect {
    value: string;
    disabled?: boolean;
    isPlaceholder?: boolean
  }

  useEffect(() => {
    fetch("http://localhost:11222/rest/v2/cache-managers/" + cm)
      .then(response => response.json())
      .then(data => {
        let options: OptionSelect[] = [];
        options.push({value: "Choose...", isPlaceholder: true})
        data.cache_configuration_names.map(name => {
          options.push({value: name})
        });
        setConfigs(options);
      });
  }, []);

  const onToggleConfigPanel = () => {
    setConfigExpanded(!configExpanded);
  };

  const handleChangeName = name => {
    setCacheName(name);
  };

  const handleChangeConfig = config => {
    setConfig(config);
  };

  const onToggle = isExpanded => {
    setExpandedSelect(isExpanded);
  };

  const clearSelection = () => {
    setSelectedConfig(null);
    setExpandedSelect(false);
  };

  const onSelect = (event, selection, isPlaceholder) => {
    if (isPlaceholder) clearSelection();
    else {
      setSelectedConfig(selection);
      setExpandedSelect(false);
    }
  };

  const createCache = () => {
    if (selectedConfig != null) {
      cacheService.createCacheByConfigName(cacheName, selectedConfig);
    } else {
      cacheService.createCacheWithConfiguration(cacheName, config);
    }
  };

  return (
    <PageSection>
      <Title size="lg"> Create a cache in <b>{cm}</b></Title>
      <Form>
        <FormGroup
          label="Name"
          isRequired
          fieldId="cache-name"
          helperText="Please provide a cache name"
        >
          <TextInput
            isRequired
            type="text"
            id="cache-name"
            name="cache-name"
            aria-describedby="cache-name-helper"
            value={cacheName}
            onChange={handleChangeName}
          />
        </FormGroup>
        <FormGroup fieldId='cache-config-name'
                   label="Template"
                   helperText="Please choose a template or provide a new configuration"
        >
          <Select
            toggleIcon={<CubeIcon/>}
            variant={SelectVariant.single}
            aria-label="Cache configs"
            onToggle={onToggle}
            onSelect={onSelect}
            // @ts-ignore
            selections={selectedConfig}
            isExpanded={expandedSelect}
            isDisabled={false}
          >
            {configs.map((option, index) => (
              <SelectOption
                isDisabled={option.disabled}
                key={index}
                value={option.value}
                isPlaceholder={option.isPlaceholder}
              />
            ))}
          </Select>

        </FormGroup>
        <Expandable toggleText="Provide a configuration" isExpanded={configExpanded} onToggle={onToggleConfigPanel}>
          <FormGroup label="Config"
                     fieldId="cache-config"
                     helperText="Please provide a cache config JSON or XML">
            <TextArea
              isRequired
              value={config}
              onChange={handleChangeConfig}
              name="cache-config"
              id="cache-config"
            />
          </FormGroup>
        </Expandable>

        <ActionGroup>
          <Button variant="primary" onClick={createCache}>Create</Button>
          <Button variant="secondary">Cancel</Button>
        </ActionGroup>
      </Form>
    </PageSection>
  );
}
export {CreateCache};
