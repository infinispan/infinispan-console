import { useTranslation } from 'react-i18next';
import { useApiAlert } from '@utils/useApiAlert';
import { useParams } from 'react-router-dom';
import { useFetchEditableConfiguration } from '@app/services/configHook';
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Alert,
  Content,
  Form,
  FormGroup,
  FormHelperText,
  FormSection,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { SelectMultiWithChips } from '@app/Common/SelectMultiWithChips';
import { selectOptionPropsFromArray } from '@utils/selectOptionPropsCreator';
import { TabsToolbar } from '@app/Caches/Configuration/Features/TabsToolbar';
import { TableLoadingState } from '@app/Common/TableLoadingState';
import { ConsoleServices } from '@services/ConsoleServices';
import { CONF_MUTABLE_SECURITY_AUTHORIZATION_ROLES } from '@services/cacheConfigUtils';
import { TableErrorState } from '@app/Common/TableErrorState';
import { useFetchAvailableRolesNames } from '@app/services/rolesHook';

const SecurityConfigEdition = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { addAlert } = useApiAlert();
  const cacheName = useParams()['cacheName'] as string;
  const { loadingConfig, errorConfig, editableConfig } = useFetchEditableConfiguration(cacheName);
  const { availableRoleNames, loading: loadingRoles, error: rolesError } = useFetchAvailableRolesNames();
  const [roles, setRoles] = useState<string[]>([]);
  const [validEntity, setvalidEntity] = useState<'success' | 'error' | 'default'>('default');
  const [updateConfigError, setUpdateConfigError] = useState<string>('');

  const onSelectRoles = (selection) => {
    if (roles.includes(selection)) setRoles(roles.filter((role) => role !== selection));
    else setRoles([...roles, selection]);
  };

  useEffect(() => {
    if (!loadingConfig && errorConfig.length == 0 && editableConfig) {
      setActualValues();
    }
  }, [loadingConfig, errorConfig, editableConfig]);

  const updateSecurity = () => {
    if (roles.length == 0) {
      setvalidEntity('error');
      return;
    }

    setvalidEntity('success');

    ConsoleServices.caches()
      .setConfigAttribute(cacheName, CONF_MUTABLE_SECURITY_AUTHORIZATION_ROLES, roles.join(' '))
      .then((actionResponse) => {
        if (actionResponse.success) {
          addAlert(actionResponse);
        } else {
          setUpdateConfigError(actionResponse.message);
        }
      });
  };

  const setActualValues = () => {
    if (!editableConfig) {
      return;
    }
    setRoles(editableConfig.securityAuthorizationRoles);
  };

  const displayError = () => {
    if (updateConfigError.length == 0) {
      return <></>;
    }

    return (
      <GridItem span={12}>
        <Alert
          variant="danger"
          isInline
          title={t('caches.edit-configuration.security-config-error', { error: updateConfigError })}
        />
      </GridItem>
    );
  };

  if (loadingRoles || loadingConfig) {
    return <TableLoadingState message={t('common.loading')} />;
  }

  if (rolesError.length != 0) {
    return <TableErrorState error={rolesError} />;
  }

  return (
    <Form
      isWidthLimited
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <FormSection title={t('caches.edit-configuration.security-title')}>
        <Grid hasGutter md={6}>
          <GridItem span={12}>
            <Content>
              {t('caches.edit-configuration.security-description', {
                brandname: brandname
              })}
            </Content>
          </GridItem>
        </Grid>

        {displayError()}
        <FormGroup
          isRequired
          label={t('caches.edit-configuration.security-authz-roles')}
          fieldId="security-authz-roles"
        >
          <SelectMultiWithChips
            id="rolesSelector"
            placeholder={'Select an role'}
            options={selectOptionPropsFromArray(availableRoleNames)}
            onSelect={onSelectRoles}
            onClear={() => setRoles([])}
            selection={roles}
          />

          {validEntity === 'error' && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant={validEntity} icon={<ExclamationCircleIcon />}>
                  {t('caches.edit-configuration.security-authz-roles-helper-invalid')}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>
        {<TabsToolbar id="security" saveAction={updateSecurity} />}
      </FormSection>
    </Form>
  );
};
export { SecurityConfigEdition };
