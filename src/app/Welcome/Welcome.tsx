import * as React from 'react';
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
  TextVariants
} from '@patternfly/react-core';

import icon from '!!url-loader!@app/assets/images/infinispan_logo_rgb_darkbluewhite_darkblue.svg';
import {CatalogIcon, GithubIcon, InfoIcon} from '@patternfly/react-icons'
import {KeycloakService} from "../../services/keycloakService";
import {chart_color_blue_500} from "@patternfly/react-tokens";
import utils from 'src/services/utils';
import authenticationService from "../../services/authService";
import {ConsoleBackground} from "@app/Common/ConsoleBackgroud";
import {Support} from "@app/Support/Support";
import {useState} from "react";

const Welcome = (props) => {
  const authState = props.init;
  const [supportOpen, setSupportOpen] = useState(false);
  const brandname = 'Infinispan';

  const description1 =
    brandname +' is a distributed in-memory key/value data store with optional schema, available under the Apache License 2.0. ' +
    'Available as an embedded Java library or as a language-independent service accessed remotely over a variety of protocols (Hot Rod, REST)';

  const description2 =
    'Use ' + brandname + ' as a cache or data grid in containerized, cloud-native environments or on bare-metal. ' +
    'Works on AWS, Azure, Google Cloud, Kubernetes and OpenShift.';

  const hotRodClientsLink = 'https://infinispan.org/hotrod-clients/';
  const aboutLink = 'https://infinispan.org/about/';
  const tutorialsLink = 'https://github.com/infinispan/infinispan-simple-tutorials';

  const buildFooter = () => {
    return (
      <Stack>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.h5}>
              Remotely connect to {brandname} from client applications.
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
            Download a client
          </Button>
        </StackItem>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.h5}>
              Find out how to set up, configure, and monitor {brandname} servers.
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
            Learn more
          </Button>
        </StackItem>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.h5}>
              Develop applications to use {brandname} for in-memory storage in a
              variety of use cases.
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
            Run the simple tutorials{' '}
          </Button>
        </StackItem>
      </Stack>
    );
  };

  const login = () => {
    if(authState == 'LOGIN' && !KeycloakService.Instance.authenticated()) {
      KeycloakService.Instance.login({redirectUri: utils.landing()});
    }
  }

  const buildConsoleButton = () => {
    if (authState == 'PENDING') {
      return (
        <Spinner size={'sm'}/>
      );
    }

    if (authState == 'READY' || authState == 'SERVER_ERROR') {
      return (
        <Button
          href={utils.landing()}
          component={'a'}
          style={{backgroundColor: chart_color_blue_500.value}}
        >
          Go to the console
        </Button>
      )
    }

    if (authState == 'NOT_READY') {
      return (
        <Button
          style={{backgroundColor: chart_color_blue_500.value}}
          onClick={() => setSupportOpen(true)}
        >
          Go to the console
        </Button>
      )
    }

    return (
      <Button style={{backgroundColor: chart_color_blue_500.value}} onClick={() => login()}>
        Go to the console
      </Button>
    );
  }

  return (
    <section>
      <ConsoleBackground/>
      <Support isModalOpen={supportOpen} closeModal={() => window.location.reload()}/>
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
          <CardFooter>
            {buildConsoleButton()}
          </CardFooter>
        </Card>
      </LoginPage>
    </section>
  );
};

export { Welcome };
