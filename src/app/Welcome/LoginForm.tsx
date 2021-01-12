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
import {useEffect, useState} from 'react';
import {useFetchUser} from "@app/services/userManagementHook";
import { useHistory } from 'react-router';

const LoginForm = (props: { isModalOpen: boolean; closeModal: () => void }) => {
  const {logUser, error, userName} = useFetchUser();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const loginWithBasicAuth = () => {
    logUser(name, password);
  };

  useEffect(() => {
    if(userName != '' && error == '') {
      props.closeModal();
      history.push('/');
    }
  }, [userName, error])

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
        <Button aria-label={'Cancel'} key="cancel" onClick={props.closeModal}>
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
