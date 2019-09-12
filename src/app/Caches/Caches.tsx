import * as React from 'react';
import {PageSection, Title,} from '@patternfly/react-core';
import {Link} from "react-router-dom";
import {useState} from "react";
import {useEffect} from "react";

const Caches: React.FunctionComponent<any> = (props) => {
  const cm = props.location.state.cacheManager;
  const caches = props.location.state.caches;


  // useEffect(() => {
  //   caches.map(cache => {
  //     fetch("http://localhost:11222/rest/v2/caches/" + cache.name)
  //       .then(response => response.json())
  //       .then(data => {
  //         console.log(data)
  //       });
  //   });
  //
  // }, []);

  return (
    <PageSection>
      <Title size="lg"><b>{cm}</b> Caches </Title>

      {caches.map(cache => {
        console.log(cache);
      })}


      <Link to=''>Back</Link>

    </PageSection>
  );
}

export {Caches};
