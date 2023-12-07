import * as React from 'react';
import { useState } from 'react';
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
import { CatalogIcon, DownloadIcon, GithubIcon, UnknownIcon } from '@patternfly/react-icons';
import { chart_color_blue_500, chart_global_Fill_Color_white } from '@patternfly/react-tokens';
import { ConsoleBackground } from '@app/Common/ConsoleBackground/ConsoleBackground';
import { Support } from '@app/Support/Support';
import { KeycloakService } from '@services/keycloakService';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { useNavigate } from 'react-router';
import { useAppInitState, useConnectedUser } from '@app/services/userManagementHook';
import { useFetchVersion } from '@app/services/serverHook';
import { aboutLink, apacheLicenseLink, blogLink, hotRodClientsLink, tutorialsLink } from '@app/utils/links';
import './Welcome.css';

const Welcome = () => {
  const { init } = useAppInitState();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [supportOpen, setSupportOpen] = useState(false);
  const { notSecuredModeOn, logUser } = useConnectedUser();
  const { version } = useFetchVersion();

  const brandname = t('brandname.brandname');

  const description1 = t('welcome-page.description1', { brandname: brandname });
  const description2 = t('welcome-page.description2', { brandname: brandname });
  const license = t('welcome-page.license');

  const login = () => {
    navigate('/')
    location.reload();
  };

  const notSecured = () => {
    navigate('/');
  };

  const goToTheConsole = t('welcome-page.go-to-console');

  const buildConsoleButton = () => {
    if (init == 'PENDING') {
      return <Spinner size={'sm'} />;
    }

    if (init == 'SERVER_ERROR') {
      return <Alert variant="danger" title="Server error. Check navigator logs" />;
    }

    let onClickGoToConsole;
    if (init == 'HTTP_LOGIN') {
      onClickGoToConsole = () => {
        ConsoleServices.authentication()
          .loginLink()
          .then((r) => {
            if (r.success) {
              logUser();
              navigate('/' + location.search);
              // history.push('/' + history.location.search);
            } else {
              // Do nothing
            }
          });
      };
    } else if (init == 'NOT_READY') {
      onClickGoToConsole = () => setSupportOpen(true);
    } else if (init == 'READY') {
      onClickGoToConsole = () => notSecuredModeOn();
    } else {
      onClickGoToConsole = () => login();
    }

    return (
      <Button
        size="lg"
        onClick={onClickGoToConsole}
        style={{ backgroundColor: chart_color_blue_500.value, color: chart_global_Fill_Color_white.value }}
      >
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
          isClickable
          className="card"
        >
          <CardHeader
            className={'card-heading'}
            selectableActions={{
              onClickAction: () => console.log(`blog clicked`),
              selectableActionId: 'blog',
              name: 'clickable-card'
            }}
          >
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
          isClickable
          className={'card'}
        >
          <CardHeader
            selectableActions={{
              onClickAction: () => console.log(`connect clicked`),
              selectableActionId: 'connect',
              name: 'clickable-card'
            }}
            className={'card-heading'}
          >
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
          isClickable
          className={'card'}
        >
          <CardHeader
            selectableActions={{
              onClickAction: () => console.log(`servers clicked`),
              selectableActionId: 'servers',
              name: 'clickable-card'
            }}
            className={'card-heading'}
          >
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
          isClickable
          className={'card'}
        >
          <CardHeader
            selectableActions={{
              onClickAction: () => console.log(`develop clicked`),
              selectableActionId: 'develop',
              name: 'clickable-card'
            }}
            className={'card-heading'}
          >
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
