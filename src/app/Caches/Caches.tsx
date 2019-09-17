import * as React from 'react';
import {useEffect} from 'react';
import {List, ListItem, PageSection, Title,} from '@patternfly/react-core';
import {useState} from "react";
import {Link} from "react-router-dom";

const Caches: React.FunctionComponent<any> = (props) => {
  const cm = props.location.state.cacheManager;
  const ca: Cache[] = props.location.state.caches;
  const [caches, setCaches] = useState<Cache[]>([]);


  useEffect(() => {
    ca.map(cache => {
      fetch("http://localhost:11222/rest/v2/caches/" + cache.name + "/?action=size")
        .then(response => response.json())
        .then(data => {
          console.log(cache);
          cache.size = data;
          caches.push(cache)
          console.log(caches);
          setCaches(caches);
        });
    });
  }, []);

  return (
    <PageSection>
      <Title size="lg"><b>{cm}</b> Caches </Title>

      <Link to={{
        pathname: '/caches/create',
        state: {
          cacheManager: cm,
        }}}>Create Cache</Link>

      {JSON.stringify(caches.length)}
      {caches.map(cache => {
        <List>
          <ListItem>{cache.name}</ListItem>
        </List>
      })}
    </PageSection>
  );
}
export {Caches};
