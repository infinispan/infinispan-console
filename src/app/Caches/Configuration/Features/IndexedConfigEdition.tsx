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
import { useFetchProtobufTypes } from '@app/services/protobufHook';
import { TabsToolbar } from '@app/Caches/Configuration/Features/TabsToolbar';
import { TableLoadingState } from '@app/Common/TableLoadingState';
import { ConsoleServices } from '@services/ConsoleServices';
import { CONF_MUTABLE_INDEXING_INDEXED_ENTITIES } from '@services/cacheConfigUtils';
import { TableErrorState } from '@app/Common/TableErrorState';

const IndexedConfigEdition = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { addAlert } = useApiAlert();
  const cacheName = useParams()['cacheName'] as string;
  const { loadingConfig, errorConfig, editableConfig } = useFetchEditableConfiguration(cacheName);
  const { protobufTypes, loading: loadingProtobufTypes, error: protobufTypesError } = useFetchProtobufTypes();
  const [indexedEntities, setIndexedEntities] = useState<string[]>([]);
  const [validEntity, setValidEntity] = useState<'success' | 'error' | 'default'>('default');
  const [updateConfigError, setUpdateConfigError] = useState<string>('');

  const onSelectSchemas = (selection) => {
    if (indexedEntities.includes(selection)) setIndexedEntities(indexedEntities.filter((role) => role !== selection));
    else setIndexedEntities([...indexedEntities, selection]);
  };

  useEffect(() => {
    if (!loadingConfig && errorConfig.length == 0 && editableConfig) {
      setActualValues();
    }
  }, [loadingConfig, errorConfig, editableConfig]);

  const updateIndexing = () => {
    if (indexedEntities.length == 0) {
      setValidEntity('error');
      return;
    }

    setValidEntity('success');

    ConsoleServices.caches()
      .setConfigAttribute(cacheName, CONF_MUTABLE_INDEXING_INDEXED_ENTITIES, indexedEntities.join(' '))
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
    setIndexedEntities(editableConfig.indexedEntities);
  };

  const displayError = () => {
    if (updateConfigError.length == 0) {
      return <></>;
    }

    return (
      <GridItem span={12}>
        <Alert variant="danger" isInline title={t('caches.edit-configuration.indexed-config-error')} />
      </GridItem>
    );
  };

  if (loadingProtobufTypes || loadingConfig) {
    return <TableLoadingState message={t('common.loading')} />;
  }

  if (protobufTypesError.length != 0) {
    return <TableErrorState error={protobufTypesError} />;
  }

  return (
    <Form
      isWidthLimited
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <FormSection title={t('caches.edit-configuration.indexed-title')}>
        <Grid hasGutter md={6}>
          <GridItem span={12}>
            <Content>
              {t('caches.edit-configuration.index-storage-description', {
                brandname: brandname
              })}
            </Content>
          </GridItem>
        </Grid>

        {displayError()}
        <FormGroup isRequired label={t('caches.edit-configuration.index-storage-entity')} fieldId="indexed-entities">
          <SelectMultiWithChips
            id="entitiesSelector"
            placeholder={'Select an entity'}
            options={selectOptionPropsFromArray(protobufTypes)}
            onSelect={onSelectSchemas}
            onClear={() => setIndexedEntities([])}
            selection={indexedEntities}
          />

          {validEntity === 'error' && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant={validEntity} icon={<ExclamationCircleIcon />}>
                  {t('caches.edit-configuration.index-storage-entity-helper-invalid')}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>
        {<TabsToolbar id="indexing" saveAction={updateIndexing} />}
      </FormSection>
    </Form>
  );
};
export { IndexedConfigEdition };
