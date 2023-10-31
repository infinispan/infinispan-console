import React, { useEffect, useState } from 'react';
import { FormGroup, FormHelperText, HelperText, HelperTextItem, SelectOptionProps } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { useCreateCache } from '@app/services/createCacheHook';
import { FeatureCard } from '@app/Caches/Create/Features/FeatureCard';
import { CacheFeature } from '@services/infinispanRefData';
import { FeatureAlert } from '@app/Caches/Create/Features/FeatureAlert';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { SelectMultiWithChips } from '@app/Common/SelectMultiWithChips';

const SecuredCacheConfigurator = (props: { isEnabled: boolean }) => {
  const { configuration, setConfiguration } = useCreateCache();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const [roles, setRoles] = useState<string[]>(configuration.feature.securedCache.roles);
  const [loading, setLoading] = useState(true);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [error, setError] = useState<'success' | 'error' | 'default'>('default');

  useEffect(() => {
    if (loading) {
      ConsoleServices.security()
        .getSecurityRolesNames()
        .then((r) => {
          if (r.isRight()) {
            setAvailableRoles(r.value);
            setError('success');
          } else {
            setError('error');
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  useEffect(() => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        feature: {
          ...prevState.feature,
          securedCache: {
            roles: roles,
            valid: securedFeatureValidation()
          }
        }
      };
    });
  }, [roles]);

  const validateForm = (): 'success' | 'default' | 'error' => {
    return roles.length == 0 ? 'error' : 'success';
  };

  const securedFeatureValidation = (): boolean => {
    if (!props.isEnabled) {
      return false;
    }
    return roles.length > 0;
  };

  const rolesOptions = () : SelectOptionProps[] => {
    const selectOptions: SelectOptionProps[] = [];
    availableRoles.forEach((role) => selectOptions.push({value: role, children: role}));
    return selectOptions;
  };

  const onSelectRoles = (selection) => {
    if (roles.includes(selection)) setRoles(roles.filter((role) => role !== selection));
    else setRoles([...roles, selection]);
  };

  if (!props.isEnabled) {
    return <FeatureAlert feature={CacheFeature.SECURED} />;
  }

  return (
    <FeatureCard
      title="caches.create.configurations.feature.secured"
      description="caches.create.configurations.feature.secured-description"
    >
      <FormGroup fieldId="select-roles" isRequired label={'Roles'}>
        <SelectMultiWithChips id="roleSelector"
                              placeholder={t('caches.create.configurations.feature.select-roles')}
                              options={rolesOptions()}
                              selection={roles}
                              onSelect={onSelectRoles}
                              onClear={() => setRoles([])}
        />
        {validateForm() === 'error' && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                {t('caches.create.configurations.feature.select-roles-helper')}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
    </FeatureCard>
  );
};

export default SecuredCacheConfigurator;
