import React, {useEffect, useState} from 'react';
import {Alert, AlertVariant, FormGroup, Select, SelectOption, SelectVariant,} from '@patternfly/react-core';
import {useTranslation} from 'react-i18next';
import {ConsoleServices} from '@services/ConsoleServices';
import {useCreateCache} from "@app/services/createCacheHook";
import {FeatureCard} from "@app/Caches/Create/Features/FeatureCard";
import {CacheFeature} from "@services/infinispanRefData";
import {FeatureAlert} from "@app/Caches/Create/Features/FeatureAlert";

const SecuredCacheConfigurator = (props: {
    isEnabled: boolean
}) => {
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
                        setError('success')
                    }
                    else {
                        setError('error');
                    }
                }).then(() => setLoading(false));
        }
    }, [loading]);

    useEffect(() => {
      setConfiguration((prevState) => {
        return {
          ...prevState,
          feature : {
            ...prevState.feature,
            securedCache: {
              roles: roles,
              valid: securedFeatureValidation()
            }
          }
        };
      });
    }, [roles]);

    const securedFeatureValidation = (): boolean => {
      if (!props.isEnabled) {
        return false;
      }
      return roles.length > 0;
    }

    const rolesOptions = () => {
        const options = availableRoles.map((role) => (
            <SelectOption inputId={role} key={role} value={role} />
        ))
        return options
    };

    const onSelectRoles = (event, selection) => {
        if (roles.includes(selection))
            setRoles(roles.filter(role => role !== selection));
        else
            setRoles([...roles, selection]);
    }

    const deleteRole = (roleToDelete: string) => {
        const newRoles = roles.filter(role => !Object.is(role, roleToDelete));
        setRoles(newRoles);
    }

    if (!props.isEnabled) {
      return (
        <FeatureAlert feature={CacheFeature.SECURED}/>
      )
    }

    return (
            <FeatureCard title="caches.create.configurations.feature.secured" description="caches.create.configurations.feature.secured-description">
                    <FormGroup fieldId='select-roles'
                               isRequired
                               label={'Roles'}
                               helperTextInvalid={t('caches.create.configurations.feature.select-roles-helper')}
                               validated={roles.length == 0 ? 'error' : 'success'}
                    >
                        <Select toggleId="roleSelector"
                                chipGroupProps={{ numChips: 4, expandedText: 'Hide', collapsedText: 'Show ${remaining}' }}
                                variant={SelectVariant.typeaheadMulti}
                                aria-label="Select Roles"
                                onToggle={() => setIsOpenRoles(!isOpenRoles)}
                                onSelect={onSelectRoles}
                                selections={roles}
                                isOpen={isOpenRoles}
                                validated={roles.length == 0 ? 'error' : 'success'}
                                placeholderText={t('caches.create.configurations.feature.select-roles')}
                        >
                            {rolesOptions()}
                        </Select>
                    </FormGroup>
            </FeatureCard>
    );
};

export default SecuredCacheConfigurator;
