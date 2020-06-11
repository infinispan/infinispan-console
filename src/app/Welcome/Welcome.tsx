import * as React from 'react';
import {useState} from 'react';
import {
  Alert,
  AlertVariant,
  BackgroundImage,
  Button,
  ListVariant,
  LoginPage,
  Page,
  Stack,
  StackItem
} from '@patternfly/react-core';
import back from '!!url-loader!@app/assets/images/infinispan_login_background.svg';
import icon from '!!url-loader!@app/assets/images/infinispan_logo.svg';
import {CatalogIcon, GithubIcon, InfoIcon} from '@patternfly/react-icons'
import {Link, useHistory} from "react-router-dom";
import authenticationService from "../../services/authService";
import {KeycloakService} from "../../services/keycloakService";

const Welcome: React.FunctionComponent<any> = props => {
  const history = useHistory();
  const [error, setError] = useState<undefined | string>();
  const brandname = 'Infinispan';

  const description1 =
    'Infinispan is a distributed in-memory key/value data store with optional schema, available under the Apache License 2.0. ' +
    'Available as an embedded Java library or as a language-independent service accessed remotely over a variety of protocols (Hot Rod, REST)';

  const description2 =
    'Use it as a cache or a data grid. Works on bare-metal, containerized and virtualized environments. ' +
    'Works on AWS, Azure, Google Cloud, Kubernetes and OpenShift.';

  const FooterList = () => {
    return (
      <Stack>
        <StackItem>
          Remotely connect to Infinispan with client applications.
        </StackItem>
        <StackItem>
          <Button
            component="a"
            href="https://infinispan.org/hotrod-clients/"
            variant="link"
            icon={<CatalogIcon />}
          >
            Download a client
          </Button>
        </StackItem>
        <StackItem>
          Find out how to set up, configure, and monitor {brandname} servers.
        </StackItem>
        <StackItem>
          <Button
            component="a"
            href="https://infinispan.org/about/"
            variant="link"
            icon={<InfoIcon />}
          >
            Learn more
          </Button>
        </StackItem>
        <StackItem>
          Develop applications to use {brandname} for in-memory storage in a
          variety of use cases.
        </StackItem>
        <StackItem>
          <Button
            component="a"
            href="https://github.com/infinispan/infinispan-simple-tutorials"
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
          <Button>
            Go to the console
          </Button>
        </Link>
      );
    }

    return (
      <Button
        href={authenticationService.httpLoginUrl()}
        component={'a'}
      >
        Go to the console
      </Button>
    );
  };

  return (
    <Page>
      <BackgroundImage src={back} />
      <LoginPage
        footerListVariants={ListVariant.inline}
        brandImgSrc={icon}
        brandImgAlt="Infinispan logo"
        backgroundImgSrc={back}
        backgroundImgAlt={brandname}
        loginTitle="Welcome to the Infinispan Server"
        footerListItems={<FooterList />}
      >
        <Stack hasGutter={true}>
          <StackItem>{description1}</StackItem>
          <StackItem>{description2}</StackItem>
          <StackItem>
            {buildConsoleButton()}
          </StackItem>
        </Stack>
      </LoginPage>
    </Page>
  );
};

export { Welcome };
