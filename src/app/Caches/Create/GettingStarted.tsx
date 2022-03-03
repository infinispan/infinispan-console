import React, { useState, useEffect } from 'react';

import {
    Form,
    FormGroup,
    Text,
    TextContent,
    TextInput,
    TextVariants,
    Radio,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { GettingStartedState } from "@app/Caches/Create/CreateCacheWizard";
import { ConsoleServices } from "@services/ConsoleServices";

const GettingStarted = (props: {
    gettingStarted: GettingStartedState
    gettingStartedModifier: (GettingStartedState) => void,
    isFormValid: boolean,
    handleIsFormValid: (isFormValid: boolean) => void,
}) => {
    const { t } = useTranslation();
    const [cacheName, setCacheName] = useState(props.gettingStarted.cacheName);
    const [validName, setValidName] = useState<'success' | 'error' | 'default'>(
        props.isFormValid ? 'success' : 'default'
    );
    const [createType, setCreateType] = useState<'configure' | 'edit'>(
        props.gettingStarted.createType
    );

    const handleChangeName = (name) => {
        let trimmedName = name.trim();

        // Check if name is not null or empty
        if (trimmedName.length > 0) {
            setValidName('success');
        }
        else {
            setValidName('error');
        }
        setCacheName(trimmedName);
    };

    useEffect(() => {
        if (cacheName === '')
            return;

        ConsoleServices.caches().cacheExists(cacheName)
            .then(response => {
                if (response.success) {
                    // the cache already exists
                    setValidName('error');
                } else {
                    setValidName('success');
                }
            })
            .catch(ex => setValidName('success'))
    }, [cacheName]);

    useEffect(() => {
        props.gettingStartedModifier({
            cacheName: cacheName,
            createType: createType,
        });
        props.handleIsFormValid(validName === 'success');
    }, [createType, validName]);

    const formCache = () => {
        return (
            <FormGroup
                label={t('caches.create.cache-name')}
                isRequired
                fieldId="cache-name"
                validated={validName}
                helperTextInvalid={t('caches.create.cache-name-help-invalid')}
            >
                <TextInput
                    isRequired
                    type="text"
                    id="cache-name"
                    name="cache-name"
                    aria-describedby="cache-name-helper"
                    value={cacheName}
                    onChange={handleChangeName}
                    validated={validName}
                />
            </FormGroup>
        );
    };

    const formConfigCache = () => {
        return (
            <FormGroup
                isInline
                isRequired
                fieldId="create-type"
            >
                <Radio
                    name="radio"
                    id="configure"
                    onChange={() => setCreateType('configure')}
                    isChecked={createType === 'configure'}
                    label={
                        <TextContent>
                            <Text component={TextVariants.h3}>{t('caches.create.getting-started.cache-type-radio1')}</Text>
                        </TextContent>
                    }
                    description={t('caches.create.getting-started.cache-type-radio1-helper')}
                />
                <Radio
                    name="radio"
                    id="edit"
                    onChange={() => setCreateType('edit')}
                    isChecked={createType === 'edit'}
                    label={
                        <TextContent>
                            <Text component={TextVariants.h3}>
                                {t('caches.create.getting-started.cache-type-radio2')}
                            </Text>
                        </TextContent>
                    }
                    description={t('caches.create.getting-started.cache-type-radio2-helper')}
                />
            </FormGroup>
        );
    };

    return (
        <Form>
            <TextContent>
                <Text component={TextVariants.h1}>{t('caches.create.getting-started.page-title')}</Text>
            </TextContent>

            <TextContent>
                <Text component={TextVariants.h3}>{t('caches.create.getting-started.cache-name')}</Text>
            </TextContent>

            {formCache()}

            <TextContent>
                <Text component={TextVariants.h3}>{t('caches.create.getting-started.cache-type')}</Text>
            </TextContent>

            {formConfigCache()}
        </Form>
    );
};

export default GettingStarted;
