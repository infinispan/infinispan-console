import React, { useEffect, useState } from 'react';
import { FormGroup, FormHelperText, HelperText, HelperTextItem } from '@patternfly/react-core';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { useCreateCache } from '@app/services/createCacheHook';
import { FeatureCard } from '@app/Caches/Create/Features/FeatureCard';
import { CacheFeature } from '@services/infinispanRefData';
import { FeatureAlert } from '@app/Caches/Create/Features/FeatureAlert';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

const SecuredCacheConfigurator = (props: { isEnabled: boolean }) => {
  const { configuration, setConfiguration } = useCreateCache();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const [roles, setRoles] = useState<string[]>(configuration.feature.securedCache.roles);

  const [loading, setLoading] = useState(true);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [error, setError] = useState<'success' | 'error' | 'default'>('default');

  const [isOpenRoles, setIsOpenRoles] = useState(false);

  useEffect(() => {
    if (loading) {
      ConsoleServices.security()
        .getSecurityRoles()
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

  const rolesOptions = () => {
    const options = availableRoles.map((role) => <SelectOption id={role} inputId={role} key={role} value={role} />);
    return options;
  };

  const onSelectRoles = (event, selection) => {
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
        <Select
          toggleId="roleSelector"
          chipGroupProps={{ numChips: 4, expandedText: 'Hide', collapsedText: 'Show ${remaining}' }}
          variant={SelectVariant.typeaheadMulti}
          aria-label="Select Roles"
          onToggle={() => setIsOpenRoles(!isOpenRoles)}
          onSelect={onSelectRoles}
          selections={roles}
          isOpen={isOpenRoles}
          validated={validateForm()}
          placeholderText={t('caches.create.configurations.feature.select-roles')}
        >
          {rolesOptions()}
        </Select>
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
