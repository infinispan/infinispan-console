import * as React from 'react';
import {PageSection, Title} from '@patternfly/react-core';
import {useEffect, useState} from "react";

const Cluster: React.FunctionComponent<any> = (props) => {
  function useFetch(url) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    async function fetchUrl() {
      const response = await fetch(url);
      const json = await response.json();
      setData(json);
      setLoading(false);
    }
    useEffect(() => {
      fetchUrl();
    }, []);
    return [data, loading];
  }
  const [data, loading] = useFetch(
    "http://localhost:11222/rest/v2/server/cache-managers/"
  );

  // const [data, setData] = useState({ cacheManagers: [] });
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const result = await fetch(
  //       'http://localhost:11222/rest/v2/server/cache-managers/',
  //     ).then(response => response.json());
  //     setData(result);
  //   };
  //   fetchData();
  // }, []);

  // const [data, setData] = useState({ cacheManagers: [] });
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const result = await fetch('http://localhost:11222/rest/v2/server/cache-managers/')
  //       .then(response => response.json());
  //     setData(result);
  //   };
  //   fetchData();
  // }, []);

  // const pepe = fetch('http://localhost:11222/rest/v2/server/cache-managers/')
  //   .then(response => response.json())
  //   .then(data => console.log(data));
  //
  // const clusterData = fetch('http://localhost:11222/rest/v2/cache-managers/DefaultCacheManager')
  //   .then(response => response.json())
  //   .then(data => console.log(data));

  // fetch('http://localhost:11222/rest/v2/server')
  //   .then(response => response.json())
  //   .then(data => console.log(data.version));
  // fetch('http://localhost:11222/rest/v2/server/config')
  //   .then(response => response.json())
  //   .then(data => console.log(data));
  // fetch('http://localhost:11222/rest/v2/server/memory')
  //   .then(response => response.json())
  //   .then(data => console.log(data));
  //
  // fetch('http://localhost:11222/rest/v2/server/env')
  //   .then(response => response.json())
  //   .then(data => console.log(data));
  //
  //   fetch('http://localhost:11222/rest/v2/server/cache-managers')
  //   .then(response => response.json())
  //   .then(data => console.log(data));
  //
  // fetch('http://localhost:11222/rest/v2/server/caches')
  //   .then(response => response.json())
  //   .then(data => console.log(data));
  //
  // fetch('http://localhost:11222/rest/v2/server/configurations')
  //   .then(response => response.json())
  //   .then(data => console.log(data));
  //
  // fetch('http://localhost:11222/rest/v2/cache-managers/DefaultCacheManager/health')
  //   .then(response => response)
  //   .then(data => console.log(data));

  return (
    <PageSection>
      <Title size="lg">Infinispan </Title>
        === {data}
    </PageSection>
  );
}

export { Cluster };
