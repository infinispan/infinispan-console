import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  Modal,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextInput,
  TextInputTypes,
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
import { useState } from 'react';

const LoginForm = (props: { isModalOpen: boolean; closeModal: () => void }) => {
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
        <Button
          aria-label={'Login'}
          key="login"
          onClick={loginWithBasicAuth}
          variant={ButtonVariant.secondary}
        >
          Log in
        </Button>,
        <Button aria-label={'Cancel'} key="login" onClick={props.closeModal}>
          Cancel
        </Button>,
      ]}
    >
      {error != '' && (
        <Alert title={error} variant={AlertVariant.danger} isInline={true} />
      )}
      <Form isHorizontal>
        <FormGroup
          label="User name"
          isRequired
          fieldId="username-field"
          helperText="Please provide the user name"
        >
          <TextInput
            value={name}
            isRequired
            type={TextInputTypes.text}
            aria-label="User name"
            aria-describedby="username-field-helper"
            onChange={setName}
          />
        </FormGroup>
        <FormGroup
          label="Password"
          isRequired
          fieldId="password-field"
          helperText="Please provide the user name"
        >
          <TextInput
            value={password}
            isRequired
            type={TextInputTypes.password}
            aria-label="Password"
            aria-describedby="password-field-helper"
            onChange={setPassword}
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export { LoginForm };
