import * as React from 'react';
import {useState} from 'react';
import {
  ActionGroup,
  Button, Expandable,
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
import {Link} from "react-router-dom";

const CreateCache: React.FunctionComponent<any> = (props) => {
  const cm = props.location.state.cacheManager;
  const [name, setName] = useState('');
  const [config, setConfig] = useState('');
  const [configs, setConfigs] = useState<OptionSelect[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState('');

  interface OptionSelect {
    value: string;
    disabled?: boolean;
    isPlaceholder?: boolean
  }

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


  const handleChangeName = name => {
    setName(name);
  };

  const handleChangeConfig = config => {
    setConfig(config);
  };

  const createCache = () => {
    let headers = new Headers();
    try {
      JSON.parse(config);
      headers.append('Content-Type', 'application/json');
    } catch (e) {
      console.log(e);
      headers.append('Content-Type', 'application/xml');
    }
    fetch('http://localhost:11222/rest/v2/caches/' + name, {
      method: 'POST',
      body: config,
      headers: headers
    }).then(function (response) {
      // display error here somewhere
      console.log(response.json());
    })
  }

  const onToggle = isExpanded => {
    setExpanded(isExpanded);
  };

  const clearSelection = () => {
    setSelected('');
    setExpanded(false);
  };

  const onSelect = (event, selection, isPlaceholder) => {
    if (isPlaceholder) clearSelection();
    else {
      setSelected(selection);
      setExpanded(false);
      console.log('selected:', selection);
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
            value={name}
            onChange={handleChangeName}
          />
        </FormGroup>
        <FormGroup fieldId='cache-config-name'
                   label="Select a template name">

          <Select
            toggleIcon={<CubeIcon/>}
            variant={SelectVariant.single}
            aria-label="Cache configs"
            onToggle={onToggle}
            onSelect={onSelect}
            selections={selected}
            isExpanded={expanded}
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
        <Expandable toggleText="Provide a configuration" isExpanded={true}>
          <FormGroup label="Config"
                     isRequired
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
