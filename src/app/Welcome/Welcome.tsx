import * as React from 'react';
import {useState} from 'react';
import {
  Alert,
  AlertVariant,
  BackgroundImage,
  Button, Card, CardBody, CardFooter, CardHeader, CardTitle,
  ListVariant,
  LoginPage,
  Page,
  Stack,
  StackItem, Text, TextContent, TextVariants
} from '@patternfly/react-core';
import back1 from '!!url-loader!@app/assets/images/infinispanbg_576.png';
import back2 from '!!url-loader!@app/assets/images/infinispanbg_576@2x.png';
import back3 from '!!url-loader!@app/assets/images/infinispanbg_768.png';
import back4 from '!!url-loader!@app/assets/images/infinispanbg_768@2x.png';
import back5 from '!!url-loader!@app/assets/images/infinispanbg_1200.png';
import icon from '!!url-loader!@app/assets/images/infinispan_logo_rgb_darkbluewhite_darkblue.svg';
import {CatalogIcon, GithubIcon, InfoIcon} from '@patternfly/react-icons'
import {Link, useHistory} from "react-router-dom";
import authenticationService from "../../services/authService";
import {KeycloakService} from "../../services/keycloakService";
import {chart_color_blue_500} from "@patternfly/react-tokens";

const Welcome: React.FunctionComponent<any> = props => {
  const history = useHistory();
  const [error, setError] = useState<undefined | string>();
  const brandname = 'Infinispan';

  const images = {
    lg: back5,
    sm: back3,
    sm2x: back4,
    xs: back1,
    xs2x: back2
  };

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

  const buildConsoleButton = () => {
    if (error) {
      return (
        <Alert variant={AlertVariant.danger} title={error}/>
      );
    }

    if (KeycloakService.Instance.isInitialized()) {
      return (
        <Link to={'/'}>
          <Button style={{backgroundColor: chart_color_blue_500.value}}>
            Go to the console
          </Button>
        </Link>
      );
    }

    return (
      <Button
        href={authenticationService.httpLoginUrl()}
        component={'a'}
        style={{backgroundColor: chart_color_blue_500.value}}
      >
        Go to the console
      </Button>
    );
  };

  const defaultFilter = (
    <filter>
    </filter>
  );

  return (
    <Page>
      <BackgroundImage src={images} filter={defaultFilter}/>
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
    </Page>
  );
};

export { Welcome };
