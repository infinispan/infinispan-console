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
import { useTranslation } from 'react-i18next';

const LoginForm = (props: { isModalOpen: boolean; closeModal: () => void }) => {
  const {logUser, error, userName} = useFetchUser();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

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
            {t('login-form.login-main')}
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
      aria-label={t('login-form.login-label')}
      actions={[
        <Button
          aria-label={'Login'}
          key="login"
          onClick={loginWithBasicAuth}
          variant={ButtonVariant.secondary}
        >
          {t('login-form.login')}
        </Button>,
        <Button aria-label={'Cancel'} key="cancel" onClick={props.closeModal}>
          {t('login-form.cancel')}
        </Button>,
      ]}
    >
      {error != '' && (
        <Alert title={error} variant={AlertVariant.danger} isInline={true} />
      )}
      <Form isHorizontal>
        <FormGroup
          label={t('login-form.form-username')}
          isRequired
          fieldId="username-field"
          helperText={t('login-form.help-username')}
        >
          <TextInput
            value={name}
            isRequired
            type={TextInputTypes.text}
            aria-label={t('login-form.form-username')}
            aria-describedby="username-field-helper"
            onChange={setName}
          />
        </FormGroup>
        <FormGroup
          label={t('login-form.form-password')}
          isRequired
          fieldId="password-field"
          helperText={t('login-form.help-password')}
        >
          <TextInput
            value={password}
            isRequired
            type={TextInputTypes.password}
            aria-label={t('login-form.form-password')}
            aria-describedby="password-field-helper"
            onChange={setPassword}
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

export { LoginForm };
