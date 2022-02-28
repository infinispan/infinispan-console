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

const GettingStarted = ({
    formCacheName,
    formCreateType,
    onFormChange,
    isFormValid
}) => {
    const { t } = useTranslation();
    const [cacheName, setCacheName] = useState(formCacheName || '');
    const [validName, setValidName] = useState<'success' | 'error' | 'default'>(
        isFormValid === true ? 'success' : 'default'
    );
    const [createType, setCreateType] = useState<'configure' | 'edit'>(
        formCreateType || ''
    );

    const handleChangeName = (name) => {
        setCacheName(name);
        if (name.length > 0) {
            setValidName('success');
        }
    };

    useEffect(() => {
        if (cacheName && validName === 'success' && createType) {
            onFormChange(true, {
                cacheName: cacheName,
                createType: createType,
            });
        } else {
            onFormChange(false, {});
        }
    }, [cacheName, createType]);

    const formCache = () => {
        return (
            <React.Fragment>
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
            </React.Fragment>
        );
    };

    const formConfigCache = () => {
        return (
            <React.Fragment>
                <FormGroup
                    isInline
                    isRequired
                    fieldId="create-type"
                >
                    <Radio
                        name="radio"
                        id="configure"
                        isDisabled
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
            </React.Fragment>
        );
    };

    return (
        <React.Fragment>
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
        </React.Fragment>
    );
};

export default GettingStarted;
