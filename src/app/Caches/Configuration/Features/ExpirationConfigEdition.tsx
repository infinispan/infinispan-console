import { useTranslation } from 'react-i18next';
import { useApiAlert } from '@utils/useApiAlert';
import { useParams } from 'react-router-dom';
import { useFetchEditableConfiguration } from '@app/services/configHook';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { TimeUnits } from '@services/infinispanRefData';
import { ConsoleServices } from '@services/ConsoleServices';
import {
  Alert,
  Form,
  FormGroup,
  FormHelperText,
  FormSection,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  Switch
} from '@patternfly/react-core';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import TimeQuantityInputGroup from '@app/Caches/Create/TimeQuantityInputGroup';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { TabsToolbar } from '@app/Caches/Configuration/Features/TabsToolbar';
import {
  convertFromTimeQuantity,
  convertTimeToMilliseconds,
  convertToTimeQuantity
} from '@utils/convertToTimeQuantity';

const ExpirationConfigEdition = () => {
  const { t } = useTranslation();
  const { addAlert } = useApiAlert();
  const cacheName = useParams()['cacheName'] as string;
  const { loadingConfig, errorConfig, editableConfig } = useFetchEditableConfiguration(cacheName);
  const [isExpiration, setIsExpiration] = useState(false);
  const [lifeSpanNumber, setLifeSpanNumber] = useState(-1);
  const [lifeSpanUnit, setLifeSpanUnit] = useState(TimeUnits.milliseconds);
  const [maxIdleNumber, setMaxIdleNumber] = useState(-1);
  const [maxIdleUnit, setMaxIdleUnit] = useState(TimeUnits.milliseconds);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loadingConfig && errorConfig.length == 0 && editableConfig) {
      setActualValues();
    }
  }, [loadingConfig, errorConfig, editableConfig]);

  const setActualValues = () => {
    if (!editableConfig) {
      return;
    }

    const maxIdle = convertFromTimeQuantity(editableConfig.maxIdle);
    const lifespan = convertFromTimeQuantity(editableConfig.lifespan);
    setLifeSpanNumber(lifespan[0]);
    setLifeSpanUnit(lifespan[1]);
    setMaxIdleNumber(maxIdle[0]);
    setMaxIdleUnit(maxIdle[1]);
    setIsExpiration(lifespan[0] != -1 || maxIdle[0] != -1);
  };

  const updateExpiration = () => {
    if (lifeSpanNumber < -1 || maxIdleNumber < -1) {
      // do nothing
      return;
    }

    if (isExpiration && lifeSpanNumber == -1 && maxIdleNumber == -1) {
      setError('error-set-lifespan-or-maxidle');
      return;
    }

    const lifespanMilliseconds = convertTimeToMilliseconds(lifeSpanNumber, lifeSpanUnit);
    const maxIdleMilliseconds = convertTimeToMilliseconds(maxIdleNumber, maxIdleUnit);

    if (lifespanMilliseconds < maxIdleMilliseconds) {
      setError('error-maxidle-must-be-lower');
      return;
    }

    setError('');

    const newLifespan = isExpiration ? convertToTimeQuantity(lifeSpanNumber, lifeSpanUnit) : '-1';
    const newMaxidle = isExpiration ? convertToTimeQuantity(maxIdleNumber, maxIdleUnit) : '-1';

    if (newMaxidle && newMaxidle != editableConfig?.maxIdle) {
      ConsoleServices.caches()
        .setConfigAttribute(cacheName, 'expiration.max-idle', newMaxidle)
        .then((actionResponse) => {
          if (actionResponse.success) {
            addAlert(actionResponse);
          } else {
            setError(actionResponse.message);
          }
        });
    }
    if (newLifespan && newLifespan != editableConfig?.lifespan) {
      ConsoleServices.caches()
        .setConfigAttribute(cacheName, 'expiration.lifespan', newLifespan)
        .then((actionResponse) => {
          if (actionResponse.success) {
            addAlert(actionResponse);
          } else {
            setError(actionResponse.message);
          }
        });
    }
  };

  const validateLifeSpan = (): 'default' | 'error' => {
    return lifeSpanNumber >= -1 ? 'default' : 'error';
  };

  const validateMaxIdle = (): 'default' | 'error' => {
    return maxIdleNumber >= -1 ? 'default' : 'error';
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
      <FormSection title={t('caches.edit-configuration.expiration-title')}>
        <FormGroup fieldId="form-expiration">
          <Switch
            aria-label="expiration"
            data-cy="expirationSwitch"
            id="expiration"
            isChecked={isExpiration}
            onChange={() => setIsExpiration(!isExpiration)}
            hasCheckIcon
            label={
              isExpiration
                ? t('caches.edit-configuration.expiration-enable')
                : t('caches.edit-configuration.expiration-disable')
            }
          />
          <PopoverHelp
            name={'expiration'}
            label={t('caches.edit-configuration.expiration-title')}
            content={t('caches.edit-configuration.expiration-tooltip')}
          />
        </FormGroup>
        <Grid hasGutter>
          {displayError()}
          <GridItem span={4}>
            <FormGroup
              fieldId="form-life-span"
              label={t('caches.edit-configuration.lifespan')}
              labelHelp={
                <PopoverHelp
                  name={'lifespan'}
                  label={t('caches.edit-configuration.lifespan')}
                  content={t('caches.edit-configuration.lifespan-tooltip')}
                />
              }
            >
              <TimeQuantityInputGroup
                name={'lifespan'}
                validate={validateLifeSpan}
                minValue={-1}
                value={lifeSpanNumber}
                valueModifier={setLifeSpanNumber}
                unit={lifeSpanUnit}
                unitModifier={setLifeSpanUnit}
                disabled={!isExpiration}
              />
              {validateLifeSpan() === 'error' && (
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                      {t('caches.edit-configuration.lifespan-helper-invalid')}
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              )}
            </FormGroup>
          </GridItem>
          <GridItem span={5}>
            <FormGroup
              fieldId="form-max-idle"
              label={t('caches.edit-configuration.max-idle')}
              labelHelp={
                <PopoverHelp
                  name={'maxidle'}
                  label={t('caches.edit-configuration.max-idle')}
                  content={t('caches.edit-configuration.max-idle-tooltip')}
                />
              }
            >
              <TimeQuantityInputGroup
                name={'maxidle'}
                validate={validateMaxIdle}
                minValue={-1}
                value={maxIdleNumber}
                valueModifier={setMaxIdleNumber}
                unit={maxIdleUnit}
                unitModifier={setMaxIdleUnit}
                disabled={!isExpiration}
              />
              {validateMaxIdle() === 'error' && (
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                      {t('caches.edit-configuration.max-idle-helper-invalid')}
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              )}
            </FormGroup>
          </GridItem>
        </Grid>
        {<TabsToolbar id="expiration" saveAction={updateExpiration} cancelAction={setActualValues} />}
      </FormSection>
    </Form>
  );
};
export { ExpirationConfigEdition };
