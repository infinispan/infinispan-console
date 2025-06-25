import React, { useEffect, useState } from 'react';
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
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  Radio,
  TextInput
} from '@patternfly/react-core';
import { EvictionType, MaxSizeUnit } from '@services/infinispanRefData';
import { useTranslation } from 'react-i18next';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { SelectSingle } from '@app/Common/SelectSingle';
import { selectOptionProps } from '@utils/selectOptionPropsCreator';
import { useApiAlert } from '@utils/useApiAlert';
import { useParams } from 'react-router-dom';
import { useFetchEditableConfiguration } from '@app/services/configHook';
import { TabsToolbar } from '@app/Caches/Configuration/Features/TabsToolbar';
import { convertToMaxSizeUnit, convertToSizeAndUnit } from '@utils/convertToSizeAndUnit';
import { ConsoleServices } from '@services/ConsoleServices';
import { validateNumber } from '@utils/validateInputNumber';

const BoundedCacheConfigurator = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { addAlert } = useApiAlert();
  const cacheName = useParams()['cacheName'] as string;
  const { loadingConfig, errorConfig, editableConfig } = useFetchEditableConfiguration(cacheName);
  const [evictionType, setEvictionType] = useState<'size' | 'count'>('size');
  const [maxValue, setMaxValue] = useState<string>('');
  const [maxSizeUnit, setMaxSizeUnit] = useState<MaxSizeUnit>(MaxSizeUnit.MB);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!loadingConfig && errorConfig.length == 0 && editableConfig) {
      setActualValues();
    }
  }, [loadingConfig, errorConfig, editableConfig]);

  const validateOnChange = () => {
    return validateNumber(maxValue, evictionType == 'count')[0];
  };

  const updateBounded = () => {
    if (maxValue.length == 0) {
      return;
    }

    const validation = validateNumber(maxValue, evictionType == 'count');
    if (validation[0] == 'error') {
      return;
    }
    let newValue = maxValue;
    if (evictionType == 'size') {
      newValue = convertToMaxSizeUnit(validation[1], maxSizeUnit);
    }

    ConsoleServices.caches()
      .setConfigAttribute(cacheName, `memory.max-${evictionType}`, newValue)
      .then((actionResponse) => {
        if (actionResponse.success) {
          addAlert(actionResponse);
        } else {
          setError(actionResponse.message);
        }
      });
  };

  const setActualValues = () => {
    if (!editableConfig) {
      return;
    }

    if (editableConfig.memoryMaxCount && editableConfig.memoryMaxCount > 0) {
      setEvictionType('count');
      setMaxValue(editableConfig.memoryMaxCount + '');
    } else {
      setEvictionType('size');
      const maxSizeAndUnit = convertToSizeAndUnit(editableConfig.memoryMaxSize);
      setMaxValue(maxSizeAndUnit[0] + '');
      setMaxSizeUnit(maxSizeAndUnit[1]);
    }
  };

  const displayError = () => {
    if (error.length == 0) {
      return <></>;
    }

    return (
      <GridItem span={12}>
        <Alert variant="danger" isInline title={t(`caches.edit-configuration.${error}`)} />
      </GridItem>
    );
  };

  return (
    <Form
      isWidthLimited
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <FormSection title={t('caches.edit-configuration.bounded-title')}>
        <Grid hasGutter md={6}>
          <GridItem span={12}>
            {evictionType === EvictionType.size}
            <Content>
              {t(`caches.edit-configuration.bounded-description-${evictionType}`, { brandname: brandname })}
            </Content>
          </GridItem>
          {displayError()}
          {evictionType === 'size' && (
            <FormGroup
              label={t('caches.edit-configuration.bounded-max-size')}
              isRequired
              fieldId="max-size"
              type="number"
            >
              <InputGroup>
                <InputGroupItem isFill>
                  <TextInput
                    data-cy="memorySizeInput"
                    validated={validateOnChange()}
                    min={0}
                    value={maxValue}
                    type="number"
                    onChange={(_event, v) => setMaxValue(v)}
                    aria-label="max-size-number-input"
                  />
                </InputGroupItem>
                <InputGroupItem>
                  <SelectSingle
                    id={'memorySizeUnit'}
                    placeholder={''}
                    selected={maxSizeUnit}
                    options={selectOptionProps(MaxSizeUnit)}
                    onSelect={(value) => setMaxSizeUnit(value)}
                  />
                </InputGroupItem>
              </InputGroup>
              {validateOnChange() === 'error' && (
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                      {t('caches.edit-configuration.bounded-max-size-helper-invalid')}
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              )}
            </FormGroup>
          )}
          {evictionType === 'count' && (
            <FormGroup
              isRequired
              fieldId="max-count"
              type="number"
              label={t('caches.edit-configuration.bounded-max-count')}
            >
              <TextInput
                data-cy="memorySizeMaxCount"
                validated={validateOnChange()}
                min={0}
                value={maxValue}
                type="number"
                onChange={(_event, v) => setMaxValue(v)}
                aria-label="max-count-input"
              />
              {validateOnChange() === 'error' && (
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                      {t('caches.edit-configuration.bounded-max-count-helper-invalid')}
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              )}
            </FormGroup>
          )}
        </Grid>
        {<TabsToolbar id="bounded" saveAction={updateBounded} cancelAction={setActualValues} />}
      </FormSection>
    </Form>
  );
};

export default BoundedCacheConfigurator;
