import * as React from 'react';
import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  ListVariant,
  LoginPage,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';

import icon from '!!url-loader!@app/assets/images/infinispan_logo_rgb_darkbluewhite_darkblue.svg';
import { CatalogIcon, GithubIcon, InfoIcon } from '@patternfly/react-icons';
import { chart_color_blue_500 } from '@patternfly/react-tokens';
import { ConsoleBackground } from '@app/Common/ConsoleBackgroud';
import { Support } from '@app/Support/Support';
import { KeycloakService } from '@services/keycloakService';
import { useTranslation } from 'react-i18next';
import {LoginForm} from "@app/Welcome/LoginForm";
import {ConsoleServices} from "@services/ConsoleServices";
import {useHistory} from "react-router";
import {useFetchUser} from "@app/services/userManagementHook";

const Welcome = (props) => {
  const authState = props.init;
  const { t } = useTranslation();
  const history = useHistory();
  const [supportOpen, setSupportOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const {notSecuredModeOn} = useFetchUser();

  const brandname = t('brandname.brandname');

  const description1 = t('welcome-page.description1', { brandname: brandname });
  const description2 = t('welcome-page.description2', { brandname: brandname });
  const license = t('welcome-page.license', { brandname: brandname });

  const hotRodClientsLink = 'https://infinispan.org/hotrod-clients/';
  const aboutLink = 'https://infinispan.org/get-started/';
  const tutorialsLink =
    'https://github.com/infinispan/infinispan-simple-tutorials';

  const buildFooter = () => {
    return (
      <Stack>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.h5}>
              {t('welcome-page.connect', { brandname: brandname })}
            </Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <Button
            component="a"
            href={hotRodClientsLink}
            variant="link"
            icon={<CatalogIcon />}
          >
            {t('welcome-page.download')}
          </Button>
        </StackItem>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.h5}>
              {t('welcome-page.servers', { brandname: brandname })}
            </Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <Button
            component="a"
            href={aboutLink}
            variant="link"
            icon={<InfoIcon />}
          >
            {t('welcome-page.learn-more')}
          </Button>
        </StackItem>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.h5}>
              {t('welcome-page.develop', { brandname: brandname })}
            </Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <Button
            component="a"
            href={tutorialsLink}
            variant="link"
            icon={<GithubIcon />}
          >
            {t('welcome-page.tutorials')}
          </Button>
        </StackItem>
      </Stack>
    );
  };

  const login = () => {
    if (authState == 'LOGIN' && !KeycloakService.Instance.authenticated()) {
      KeycloakService.Instance.login({ redirectUri: ConsoleServices.landing() });
    }
  };

  const notSecured = () => {

    history.push('/')
  }

  const goToTheConsole = t('welcome-page.go-to-console');

  const buildConsoleButton = () => {
    if (authState == 'PENDING') {
      return <Spinner size={'sm'} />;
    }

    if (authState == 'SERVER_ERROR') {
      return (
        <Alert variant="danger" title="Server error. Check navigator logs" />
      );
    }

    if (authState == 'DIGEST_LOGIN') {
      return (
        <Button
          onClick={() => setLogModalOpen(true)}
          component={'button'}
          style={{ backgroundColor: chart_color_blue_500.value }}
        >
          {goToTheConsole}
        </Button>
      );
    }

    if (authState == 'NOT_READY') {
      return (
        <Button
          style={{ backgroundColor: chart_color_blue_500.value }}
          onClick={() => setSupportOpen(true)}
        >
          {goToTheConsole}
        </Button>
      );
    }

    if (authState == 'READY') {
      return (
        <Button
          style={{ backgroundColor: chart_color_blue_500.value }}
          onClick={() => notSecuredModeOn()}
        >
          {goToTheConsole}
        </Button>
      );
    }

    return (
      <Button
        style={{ backgroundColor: chart_color_blue_500.value }}
        onClick={() => login()}
      >
        {goToTheConsole}
      </Button>
    );
  };

  return (
    <section>
      <ConsoleBackground />
      <Support
        isModalOpen={supportOpen}
        closeModal={() => window.location.reload()}
      />
      <LoginForm
        isModalOpen={logModalOpen}
        closeModal={() => setLogModalOpen(false)}
      />
      <LoginPage
        footerListVariants={ListVariant.inline}
        brandImgSrc={icon}
        brandImgAlt={brandname + ' logo'}
        backgroundImgAlt={brandname}
        loginTitle={'Welcome to ' + brandname + ' Server'}
        footerListItems={buildFooter()}
      >
        <Card>
          <CardHeader>{description1}</CardHeader>
          <CardBody>{description2}</CardBody>
          <CardBody>{license}</CardBody>
          <CardFooter>{buildConsoleButton()}</CardFooter>
        </Card>
      </LoginPage>
    </section>
  );
};

export { Welcome };
