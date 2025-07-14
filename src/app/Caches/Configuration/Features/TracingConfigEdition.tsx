import * as React from 'react';
import {
  Form,
  FormGroup,
  FormHelperText,
  FormSection,
  HelperText,
  HelperTextItem,
  Switch
} from '@patternfly/react-core';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { SelectMultiWithChips } from '@app/Common/SelectMultiWithChips';
import { TracingCategories } from '@services/infinispanRefData';
import { selectOptionPropsFromArray } from '@utils/selectOptionPropsCreator';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { TableErrorState } from '@app/Common/TableErrorState';
import { TableLoadingState } from '@app/Common/TableLoadingState';
import { TabsToolbar } from '@app/Caches/Configuration/Features/TabsToolbar';
import { ConsoleServices } from '@services/ConsoleServices';
import { CONF_MUTABLE_TRACING_CATEGORIES, CONF_MUTABLE_TRACING_ENABLED } from '@services/cacheConfigUtils';
import { useFetchEditableConfiguration } from '@app/services/configHook';
import { useApiAlert } from '@utils/useApiAlert';
import { useEffect, useState } from 'react';

const TracingConfigEdition = () => {
  const { t } = useTranslation();
  const cacheName = useParams()['cacheName'] as string;
  const { loadingConfig, errorConfig, editableConfig } = useFetchEditableConfiguration(cacheName);
  const { addAlert } = useApiAlert();
  const [tracingEnabled, setTracingEnabled] = useState(false);
  const [tracingCategories, setTracingCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!loadingConfig && errorConfig.length == 0 && editableConfig) {
      setActualValues();
    }
  }, [loadingConfig, errorConfig, editableConfig]);

  const setActualValues = () => {
    if (!editableConfig) {
      return;
    }
    setTracingEnabled(editableConfig.tracingEnabled);
    setTracingCategories(editableConfig.tracingCategories);
  };

  const updateTracing = () => {
    ConsoleServices.caches()
      .setConfigAttribute(cacheName, CONF_MUTABLE_TRACING_ENABLED, tracingEnabled + '')
      .then((actionResponse) => {
        if (tracingCategories.length > 0) {
          ConsoleServices.caches()
            .setConfigAttribute(cacheName, CONF_MUTABLE_TRACING_CATEGORIES, tracingCategories.join(' '))
            .then((actionResponse) => {
              addAlert(actionResponse);
            });
        }
      });
  };

  const enableTracing = () => {
    return (
      <FormGroup fieldId="form-tracing">
        <Switch
          aria-label="tracing"
          data-cy="tracingSwitch"
          id="tracing"
          isChecked={tracingEnabled}
          onChange={() => {
            setTracingEnabled(!tracingEnabled);
          }}
          hasCheckIcon
          label={tracingEnabled ? t('caches.tracing.tracing-enabled') : t('caches.tracing.tracing-disabled')}
        />
        <PopoverHelp name={'tracing'} label={t('caches.tracing.title')} content={t('caches.tracing.tracing-tooltip')} />
      </FormGroup>
    );
  };

  const categories = () => {
    if (!tracingEnabled) {
      return;
    }

    return (
      <FormGroup fieldId="select-categories" isRequired label={'Categories'}>
        <SelectMultiWithChips
          id="categorySelector"
          placeholder={t('caches.tracing.select-tracing-categories')}
          options={selectOptionPropsFromArray(TracingCategories)}
          selection={tracingCategories}
          onSelect={onSelectCategories}
          onClear={() => setTracingCategories([])}
        />
        {validateForm() === 'error' && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                {t('caches.tracing.select-tracing-categories-helper')}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
    );
  };

  const onSelectCategories = (selection: string) => {
    if (tracingCategories.includes(selection)) {
      setTracingCategories(tracingCategories.filter((category) => category !== selection));
    } else {
      setTracingCategories([...tracingCategories, selection]);
    }
  };

  const validateForm = (): 'success' | 'default' | 'error' => {
    return tracingEnabled && tracingCategories.length == 0 ? 'error' : 'success';
  };

  if (loadingConfig) {
    return <TableLoadingState message={t('common.loading')} />;
  }

  if (errorConfig != '') {
    return <TableErrorState error={errorConfig} />;
  }

  return (
    <Form title={t('caches.tracing.tracing-title')}>
      <FormSection title={t('caches.edit-configuration.tracing-title')}>
        {enableTracing()}
        {categories()}
        {<TabsToolbar id="tracing" saveAction={updateTracing} />}
      </FormSection>
    </Form>
  );
};
export { TracingConfigEdition };
