import * as React from 'react';
import {useState} from 'react';
import {PageSection, Title,} from '@patternfly/react-core';
import {useEffect} from "react";

const InfinispanServer: React.FunctionComponent<any> = (props) => {
  const [version, setVersion] =  useState('');
  useEffect(() => {
    var misCabeceras = new Headers();
    misCabeceras.append('Authorization', 'Basic ' + btoa(unescape(encodeURIComponent('kat:kat'))));

    var miInit = { method: 'GET',
      headers: misCabeceras};

    fetch("http://localhost:11222/rest/v2/server/", miInit)
      .then(response => response.json())
      .then(data => {
        setVersion(data.version);
      });
  }, []);
  return (
    <PageSection>
      <Title size="lg">Infinispan Server version <b>{version}</b> </Title>
    </PageSection>
  );
}

export {InfinispanServer};
