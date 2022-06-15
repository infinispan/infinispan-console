import React, {useEffect, useState} from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FlexItem,
  FormGroup, HelperText, HelperTextItem,
  Hint, HintBody, HintFooter,
  Select,
  SelectOption,
  SelectVariant,
  Switch,
  Text,
  TextContent,
  TextInput,
  TextVariants,
} from '@patternfly/react-core';
import {CodeEditor, Language} from '@patternfly/react-code-editor';
import {useTranslation} from 'react-i18next';
import {PersistentCacheStorage, PersistentStorageConfig} from "@services/infinispanRefData";
import {MoreInfoTooltip} from '@app/Common/MoreInfoTooltip';
import {kebabCase} from "@app/utils/convertStringCase";

const PersistentCacheConfigurator = (props: {
    persistentOptions: PersistentCache,
    persistentOptionsModifier: (PersistentCache) => void,
}) => {

    const { t } = useTranslation();
    const brandname = t('brandname.brandname');

    const [passivation, setPassivation] = useState(props.persistentOptions.passivation);
    const [connectionAttempts, setConnectionAttempts] = useState(props.persistentOptions.connectionAttempts);
    const [connectionInterval, setConnectionInterval] = useState(props.persistentOptions.connectionInterval);
    const [availabilityInterval, setAvailabilityInterval] = useState(props.persistentOptions.availabilityInterval);

    const [storage, setStorage] = useState(props.persistentOptions.storage as PersistentCacheStorage);
    const [config, setConfig] = useState(props.persistentOptions.config);
    const [valid, setValid] = useState(props.persistentOptions.valid);
    const [isOpenStorages, setIsOpenStorages] = useState(false);

    useEffect(() => {
        props.persistentOptionsModifier({
            passivation: passivation,
            connectionAttempts: connectionAttempts,
            connectionInterval: connectionInterval,
            availabilityInterval: availabilityInterval,
            storage: storage,
            config: config,
            valid: valid
        });
    }, [passivation, connectionAttempts, connectionInterval, availabilityInterval, storage, config, valid]);

    const onSelectStorage = (event, selection) => {
      setStorage(selection);
      let initConfig = PersistentStorageConfig.get(PersistentCacheStorage[selection as PersistentCacheStorage]);
      setConfig(initConfig? initConfig: '');
      setIsOpenStorages(false);
      setValid(true);
    };

    const persistentStorageOptions = () => {
        return Object.keys(PersistentCacheStorage).map((key) => (
          <SelectOption key={key} value={key}>{PersistentCacheStorage[key]}</SelectOption>
        ));
    };

    const changeAndValidate = (value: string) => {
      setConfig(value);
      try {
        JSON.parse(value)
        setValid(true);
      } catch (e) {
        setValid(false);
      }
    }

    const displayValidationError = () => {
      if (valid) {
        return '';
      }

      return (
        <HelperText>
          <HelperTextItem variant="warning" hasIcon>
            {t('caches.create.configurations.feature.persistent-error')}
          </HelperTextItem>
        </HelperText>
      );
    }

    const displayEditor = () => {
      if(!storage) {
        return '';
      }

      return (
        <React.Fragment>
          <CardBody>
            <Hint>
              <HintBody>
                {t('caches.create.configurations.feature.persistent-hint')}
              </HintBody>
              <HintFooter>
                <Button variant="link" isInline onClick={() => window.open(t('brandname.persistence-docs-link'), '_blank')}>
                  {t('caches.create.configurations.feature.persistent-hint-link')}
                </Button>
              </HintFooter>
            </Hint>
          </CardBody>
          <CardBody>
            <FormGroup fieldId="storage-configuration"
                       isRequired>
              <TextContent>
                <Text component={TextVariants.h3}>{PersistentCacheStorage[storage]}</Text>
                <Text component={TextVariants.p}>{t('caches.create.configurations.feature.' +  kebabCase(storage) + "-description", {"brandname": brandname})}</Text>
              </TextContent>
              <CodeEditor
                isLineNumbersVisible
                isLanguageLabelVisible
                code={config}
                onChange={changeAndValidate}
                language={Language.json}
                height={'sizeToFit'}
              />
              {displayValidationError()}
            </FormGroup>
          </CardBody>
        </React.Fragment>
      )
    }

    return (
            <Card>
                <CardHeader>
                    <TextContent>
                        <Text component={TextVariants.h2}>{t('caches.create.configurations.feature.persistent')}</Text>
                        <Text component={TextVariants.p}>{t('caches.create.configurations.feature.persistent-description', {"brandname": brandname})}</Text>
                    </TextContent>
                </CardHeader>
                <CardBody>
                    <FormGroup
                        isInline
                        fieldId='passivation'
                    >
                        <Switch
                            aria-label="passivation"
                            id="passivation-switch"
                            isChecked={passivation}
                            onChange={() => setPassivation(!passivation)}
                            isReversed
                        />
                        <MoreInfoTooltip label={t('caches.create.configurations.feature.passivation')} toolTip={t('caches.create.configurations.feature.passivation-tooltip')} textComponent={TextVariants.h3} />
                    </FormGroup>
                </CardBody>
                <CardBody>
                    <Flex>
                        <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                            <FormGroup
                                isInline
                                fieldId='connection-attempts'
                            >
                                <MoreInfoTooltip label={t('caches.create.configurations.feature.connection-attempts')} toolTip={t('caches.create.configurations.feature.connection-attempts-tooltip')} textComponent={TextVariants.h3} />
                                <TextInput placeholder='10' value={connectionAttempts} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setConnectionAttempts(undefined!) : setConnectionAttempts(parseInt(val)) }} aria-label="connection-attempts" />
                            </FormGroup>
                        </FlexItem>
                        <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                            <FormGroup
                                isInline
                                fieldId='connection-interval'
                            >
                                <MoreInfoTooltip label={t('caches.create.configurations.feature.connection-interval')} toolTip={t('caches.create.configurations.feature.connection-interval-tooltip')} textComponent={TextVariants.h3} />
                                <TextInput placeholder='50' value={connectionInterval} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setConnectionInterval(undefined!) : setConnectionInterval(parseInt(val)) }} aria-label="connection-interval" />
                            </FormGroup>
                        </FlexItem>
                        <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                            <FormGroup
                                isInline
                                fieldId='availability-interval'
                            >
                                <MoreInfoTooltip label={t('caches.create.configurations.feature.availability-interval')} toolTip={t('caches.create.configurations.feature.availability-interval-tooltip')} textComponent={TextVariants.h3} />
                                <TextInput placeholder='1000' value={availabilityInterval} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setAvailabilityInterval(undefined!) : setAvailabilityInterval(parseInt(val)) }} aria-label="availability-interval" />
                            </FormGroup>
                        </FlexItem>
                    </Flex>
                </CardBody>
                <CardBody>
                    <FormGroup fieldId='storages'>
                        <MoreInfoTooltip label={t('caches.create.configurations.feature.storages')} toolTip={t('caches.create.configurations.feature.storages-tooltip')} textComponent={TextVariants.h3} />
                        <Select
                            variant={SelectVariant.single}
                            typeAheadAriaLabel="persistent-storage"
                            onToggle={() => setIsOpenStorages(!isOpenStorages)}
                            onSelect={onSelectStorage}
                            selections={storage}
                            isOpen={isOpenStorages}
                            aria-labelledby="persistent-storage"
                            placeholderText={t('caches.create.configurations.feature.storage-placeholder')}
                        >
                            {persistentStorageOptions()}
                        </Select>
                    </FormGroup>
                </CardBody>
                {displayEditor()}
            </Card>
    );
};

export default PersistentCacheConfigurator;
