import * as React from 'react';
import {BackgroundImage, BackgroundImageSrc, Button, LoginPage, Page, Stack, StackItem,} from '@patternfly/react-core';
import {Link} from "react-router-dom";
import back from '!!url-loader!@app/assets/images/infinispan_login_background.svg';
import icon from '!!url-loader!@app/assets/images/infinispan_logo.svg';
import {ApplicationsIcon, CatalogIcon, InfoIcon} from "@patternfly/react-icons";

const Welcome: React.FunctionComponent<any> = (props) => {

  const images = {
    [BackgroundImageSrc.xs]: back,
    [BackgroundImageSrc.xs2x]: back,
    [BackgroundImageSrc.sm]: back,
    [BackgroundImageSrc.sm2x]: back,
    [BackgroundImageSrc.lg]: back
  };

  const brandname = 'Infinispan';

  const description = 'Infinispan is a distributed in-memory key/value data store with optional schema, available under the Apache License 2.0. ' +
    'Available as an embedded Java library or as a language-independent service accessed remotely over a variety of protocols (Hot Rod, REST)'
    + 'Use it as a cache or a data grid. Works on bare-metal, containerized and virtualized environments. ' +
    'Works on AWS, Azure, Google Cloud, Kubernetes and OpenShift.';

  return (
    <Page>
      <BackgroundImage src={images}/>
      <LoginPage
        footerListVariants="inline"
        brandImgSrc={icon}
        brandImgAlt="PatternFly logo"
        backgroundImgSrc={images}
        backgroundImgAlt="Images"
        textContent={description}
        loginTitle="Welcome to the Infinispan Server"
        footerListItems={<Link to={{pathname: '/'}} target='_blank'><Button>Go to the console</Button></Link>}
      >
        <Stack gutter={"md"}>
          <StackItem>Remotely connect to Infinispan with client applications.</StackItem>
          <StackItem><Button component="a" href="https://infinispan.org/hotrod-clients/" variant="link"
                             icon={<CatalogIcon/>}>Download a client</Button></StackItem>
          <StackItem>Find out how to set up, configure, and monitor {brandname} servers.</StackItem>
          <StackItem><Button component="a" href="https://infinispan.org/about/" variant="link" icon={<InfoIcon/>}>Learn
            more</Button></StackItem>
          <StackItem>Develop applications to use {brandname} for in-memory storage in a variety of use
            cases.</StackItem>
          <StackItem><Button component="a" href="https://github.com/infinispan/infinispan-simple-tutorials"
                             variant="link" icon={<ApplicationsIcon/>}>Run the simple tutorials </Button></StackItem>
        </Stack>
      </LoginPage>
    </Page>
  );
}

export {Welcome};
