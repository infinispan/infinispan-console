import * as React from 'react';
import { useState } from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  PageSection,
  PageSectionVariants,
  Spinner,
  Switch,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { Link, useParams } from 'react-router-dom';
import { global_spacer_md } from '@patternfly/react-tokens';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import { useTranslation } from 'react-i18next';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { SelectMultiWithChips } from '@app/Common/SelectMultiWithChips';
import { TracingCategories } from '@services/infinispanRefData';
import { selectOptionPropsFromArray } from '@utils/selectOptionPropsCreator';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { useFetchTracingConfig } from '@app/services/configHook';
import { TableErrorState } from '@app/Common/TableErrorState';

const TracingManagement = () => {
  const { t } = useTranslation();
  const { connectedUser } = useConnectedUser();
  const cacheName = useParams()['cacheName'] as string;
  const [change, setChange] = useState(false);
  const { tracingEnabled, tracingCategories, setTracingCategories, setTracingEnabled, loading, error, update } =
    useFetchTracingConfig(cacheName);

  const enableTracing = () => {
    return (
      <FormGroup fieldId="form-tracing">
        <Switch
          aria-label="tracing"
          data-cy="tracingSwitch"
          id="tracing"
          isChecked={tracingEnabled}
          onChange={() => {
            setChange(true);
            setTracingEnabled(!tracingEnabled)
          }}
          labelOff={t('caches.tracing.tracing-disable')}
          label={t('caches.tracing.tracing-enable')}
        />
        <PopoverHelp
          name={'tracing'}
          label={t('caches.tracing.title')}
          content={t('caches.tracing.tracing-tooltip')}
        />
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
    setChange(true);
  };

  const validateForm = (): 'success' | 'default' | 'error' => {
    return tracingEnabled && tracingCategories.length == 0 ? 'error' : 'success';
  };

  const displaySave = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      return;
    }

    return (
      <Button data-cy="saveButton" isDisabled={validateForm() == 'error' || !change} onClick={ () => {
        setChange(false);
        update();
      }}>
        {t('common.actions.save')}
      </Button>
    );
  };

  const buildTracingPageContent = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
      return;
    }

    if (loading) {
      return <Spinner size={'xl'} />;
    }

    if (error != '') {
      return <TableErrorState error={error} />;
    }

    return (
      <Form title={t('caches.tracing.tracing-title')}>
        {enableTracing()}
        {categories()}
      </Form>
    );
  };

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <DataContainerBreadcrumb currentPage={t('caches.tracing.title')} cacheName={cacheName} />
        <Toolbar key={'title-tracing'}>
          <ToolbarContent>
            <ToolbarItem>
              <TextContent>
                <Text component={TextVariants.h1} key={'title-value-tracing'}>
                  {t('caches.tracing.title')}
                </Text>
              </TextContent>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </PageSection>
      <PageSection>
        <Card>
          <CardBody>
            {buildTracingPageContent()}
            <Toolbar id="tracing-page-toolbar">
              <ToolbarContent style={{ paddingLeft: 0, paddingTop: global_spacer_md.value }}>
                <ToolbarItem>
                  {displaySave()}
                  <Link
                    to={{
                      pathname: '/cache/' + encodeURIComponent(cacheName),
                      search: location.search
                    }}
                  >
                    <Button variant={ButtonVariant.link} data-cy="backButton">
                      {t('common.actions.back')}
                    </Button>
                  </Link>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
          </CardBody>
        </Card>
      </PageSection>
    </React.Fragment>
  );
};
export { TracingManagement };
