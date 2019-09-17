import * as React from 'react';
import {useState} from 'react';
import {ActionGroup, Button, Form, FormGroup, PageSection, TextArea, TextInput, Title,} from '@patternfly/react-core';

const CreateCache: React.FunctionComponent<any> = (props) => {
  const cm = props.location.state.cacheManager;
  const [name, setName] = useState('');
  const [config, setConfig] = useState('');
  const handleChangeName = name => {
    setName(name);
  };

  const handleChangeConfig = config => {
    setConfig(config);
  };

  function createCache() {
    let headers = new Headers();
    try {
      JSON.parse(config);
      headers.append('Content-Type', 'application/json');
    } catch (e) {
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
        <ActionGroup>
          <Button variant="primary" onClick={createCache}>Create</Button>
          <Button variant="secondary">Cancel</Button>
        </ActionGroup>
      </Form>
    </PageSection>
  );
}
export {CreateCache};
