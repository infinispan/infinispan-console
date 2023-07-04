import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FlexItem,
  Gallery,
  GalleryItem,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextVariants,
  Title,
  TitleSizes
} from '@patternfly/react-core';
import icon from '!!url-loader!@app/assets/images/infinispan_logo_rgb_darkbluewhite_darkblue.svg';
import { CatalogIcon, GithubIcon, ExternalLinkAltIcon, DownloadIcon, UnknownIcon } from '@patternfly/react-icons';
import { chart_color_blue_500, global_BackgroundColor_100 } from '@patternfly/react-tokens';
import { ConsoleBackground } from '@app/Common/ConsoleBackgroud';
import { Support } from '@app/Support/Support';
import { KeycloakService } from '@services/keycloakService';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { useHistory } from 'react-router';
import { useConnectedUser } from '@app/services/userManagementHook';
import { useFetchVersion } from '@app/services/serverHook';
import { hotRodClientsLink, aboutLink, tutorialsLink, blogLink, apacheLicenseLink } from '@app/utils/links';
import { checkIfServerVersionIsGreaterOrEqual } from '@app/utils/serverVersionUtils';

import './Welcome.css';

const Welcome = (props) => {
  const authState = props.init;
  const { t } = useTranslation();
  const history = useHistory();
  const [supportOpen, setSupportOpen] = useState(false);
  const { notSecuredModeOn, logUser } = useConnectedUser();
  const { version } = useFetchVersion();

  const brandname = t('brandname.brandname');

  const description1 = t('welcome-page.description1', { brandname: brandname });
  const description2 = t('welcome-page.description2', { brandname: brandname });
  const license = t('welcome-page.license');

  const login = () => {
    if (authState == 'LOGIN' && !KeycloakService.Instance.authenticated()) {
      KeycloakService.Instance.login({ redirectUri: ConsoleServices.landing() });
    }
  };

  const notSecured = () => {
    history.push('/' + history.location.search);
  };

  const goToTheConsole = t('welcome-page.go-to-console');

  const buildConsoleButton = () => {
    if (authState == 'PENDING') {
      return <Spinner size={'sm'} />;
    }

    if (authState == 'SERVER_ERROR') {
      return <Alert variant="danger" title="Server error. Check navigator logs" />;
    }

    if (authState == 'HTTP_LOGIN') {
      return (
        <Button
          isLarge
          onClick={() => {
            ConsoleServices.authentication()
              .loginLink()
              .then((r) => {
                if (r.success) {
                  logUser();
                  history.push('/' + history.location.search);
                } else {
                  // Do nothing
                }
              });
          }}
          component={'button'}
          className={'button'}
          style={{ backgroundColor: global_BackgroundColor_100.value }}
        >
          <Text style={{ color: chart_color_blue_500.value }}>{goToTheConsole}</Text>
        </Button>
      );
    }

    if (authState == 'NOT_READY') {
      return (
        <Button isLarge style={{ backgroundColor: chart_color_blue_500.value }} onClick={() => setSupportOpen(true)}>
          {goToTheConsole}
        </Button>
      );
    }

    if (authState == 'READY') {
      return (
        <Button isLarge style={{ backgroundColor: chart_color_blue_500.value }} onClick={() => notSecuredModeOn()}>
          {goToTheConsole}
        </Button>
      );
    }

    return (
      <Button isLarge style={{ backgroundColor: chart_color_blue_500.value }} onClick={() => login()}>
        {goToTheConsole}
      </Button>
    );
  };

  const DetailSection = (
    <Stack className="detail-section">
      <StackItem>
        <img width={'200px'} height={'42px'} src={icon} alt={brandname + ' logo'} />
      </StackItem>
      <StackItem className={'font-title-bold'}>
        <Title style={{ fontWeight: 'bold' }} size={TitleSizes['4xl']} headingLevel="h1">
          {t('welcome-page.welcome-title', { brandname: brandname })}
        </Title>
      </StackItem>
      {version !== '' && (
        <StackItem className={'version-text'}>
          <Flex>
            <FlexItem>
              <Text>{t('welcome-page.current-version')}</Text>
            </FlexItem>
            <FlexItem>
              <Badge style={{ backgroundColor: 'white', color: chart_color_blue_500.value }}>{version}</Badge>
            </FlexItem>
          </Flex>
        </StackItem>
      )}
      <StackItem className={'description'}>
        <Text component={TextVariants.p}>{description1}</Text>
        <Text component={TextVariants.p}>{description2}</Text>
        <Text component={TextVariants.p}>
          {license}{' '}
          <a style={{ color: 'white', textDecoration: 'underline' }} href={apacheLicenseLink} target="blank">
            {t('welcome-page.apache-license')}
          </a>
        </Text>
      </StackItem>
      <StackItem>{buildConsoleButton()}</StackItem>
    </Stack>
  );

  const FooterCards = (
    <Gallery className={'card-container'} hasGutter>
      <GalleryItem>
        <Card
          onClick={() => {
            window.open(blogLink, '_blank');
          }}
          isSelectableRaised
          className={'card'}
        >
          <CardHeader className={'card-heading'}>
            <Text>
              <CatalogIcon />
              {t('welcome-page.blog')}
            </Text>
          </CardHeader>
          <CardBody className={'card-contents'}>{t('welcome-page.blog-description')}</CardBody>
        </Card>
      </GalleryItem>
      <GalleryItem>
        <Card
          onClick={() => {
            window.open(hotRodClientsLink, '_blank');
          }}
          isSelectableRaised
          className={'card'}
        >
          <CardHeader className={'card-heading'}>
            <Text>
              <DownloadIcon />
              {t('welcome-page.download')}
            </Text>
          </CardHeader>
          <CardBody className={'card-contents'}>{t('welcome-page.connect', { brandname: brandname })}</CardBody>
        </Card>
      </GalleryItem>
      <GalleryItem>
        <Card
          onClick={() => {
            window.open(aboutLink, '_blank');
          }}
          isSelectableRaised
          className={'card'}
        >
          <CardHeader className={'card-heading'}>
            <Text>
              <UnknownIcon />
              {t('welcome-page.learn-more')}
            </Text>
          </CardHeader>
          <CardBody className={'card-contents'}>{t('welcome-page.servers', { brandname: brandname })}</CardBody>
        </Card>
      </GalleryItem>
      <GalleryItem>
        <Card
          onClick={() => {
            window.open(tutorialsLink, '_blank');
          }}
          isSelectableRaised
          className={'card'}
        >
          <CardHeader className={'card-heading'}>
            <Text>
              <GithubIcon />
              {t('welcome-page.tutorials')}
            </Text>
          </CardHeader>
          <CardBody className={'card-contents'}>{t('welcome-page.develop', { brandname: brandname })}</CardBody>
        </Card>
      </GalleryItem>
    </Gallery>
  );

  return (
    <Stack className="welcome-container">
      <ConsoleBackground />
      <Support isModalOpen={supportOpen} closeModal={() => window.location.reload()} />
      <StackItem isFilled className="upper-section">
        {DetailSection}
      </StackItem>
      <StackItem className="lower-section">{FooterCards}</StackItem>
    </Stack>
  );
};

export { Welcome };
