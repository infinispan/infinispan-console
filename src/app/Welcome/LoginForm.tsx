import {
  Alert,
  AlertVariant,
  Button,
  Form,
  Modal,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextInput,
  TextVariants,
} from '@patternfly/react-core';
import { UserIcon } from '@patternfly/react-icons';
import {
  global_FontSize_4xl,
  global_spacer_md,
  global_spacer_sm,
} from '@patternfly/react-tokens';
import * as React from 'react';
import authenticationService from '@services/authService';
import { useHistory } from 'react-router';
import { useState } from 'react';

const LoginForm = (props: { isModalOpen: boolean; closeModal: () => void }) => {
  let history = useHistory();
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const loginWithBasicAuth = () => {
    authenticationService.login(name, password).then((actionResult) => {
      if (actionResult.success) {
        props.closeModal();
      } else {
        console.error(actionResult.message);
        setError(actionResult.message);
      }
    });
  };

  const header = (
    <Stack hasGutter={true}>
      <StackItem>
        <TextContent>
          <Text component={TextVariants.h1}>
            <UserIcon
              style={{
                fontSize: global_FontSize_4xl.value,
                verticalAlign: 'middle',
                marginRight: global_spacer_md.value,
                marginBottom: global_spacer_sm.value,
              }}
            />
            Log to the Infinispan Server
          </Text>
        </TextContent>
      </StackItem>
    </Stack>
  );

  return (
    <Modal
      className="pf-m-redhat-font"
      header={header}
      width={'50%'}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      aria-label="Log to Infinispan dialog"
      actions={[
        <Button aria-label={'Login'} key="login" onClick={loginWithBasicAuth}>
          Login
        </Button>,
      ]}
    >
      {error != '' && (
        <Alert title={error} variant={AlertVariant.danger} isInline={true} />
      )}
      <Form>
        <TextInput
          isRequired
          type="text"
          id="simple-form-name"
          name="value1"
          aria-describedby="simple-form-name-helper"
          value={name}
          onChange={setName}
        />
        <TextInput
          isRequired
          type="text"
          id="simple-form-name"
          name="value2"
          aria-describedby="simple-form-name-helper"
          value={password}
          onChange={setPassword}
        />
      </Form>
    </Modal>
  );
};

export { LoginForm };
