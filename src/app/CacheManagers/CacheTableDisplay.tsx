import React, {useEffect, useState} from 'react';
import {cellWidth, Table, TableBody, TableHeader,} from '@patternfly/react-table';
import {Label, Level, LevelItem, Tooltip} from "@patternfly/react-core";
import {chart_color_black_100, chart_color_blue_500} from "@patternfly/react-tokens";
import displayUtils from "../../services/displayUtils";
import {
  DegradedIcon,
  InfoIcon,
  KeyIcon,
  SaveIcon,
  ServiceIcon,
  Spinner2Icon,
  StorageDomainIcon
} from "@patternfly/react-icons";
import {Link} from "react-router-dom";

const CacheTableDisplay: React.FunctionComponent<any> = (props) => {
  let caches: CacheInfo[] = props.caches;

  const CacheActionLinks: React.FunctionComponent<any> = (props) => {
    const name: string = props.name;

    return (<Link to={{
      pathname: '/cache/' + name,
      state: {
        cacheName: name,
      }
    }}><InfoIcon/>More</Link>);
  };

  const hasFeatureColor = (feature) => {
    if (feature) {
      return chart_color_blue_500.value;
    } else {
      return chart_color_black_100.value;
    }
  };

  const CacheFeatures: React.FunctionComponent<any> = (props) => {
    const cache: CacheInfo = props.cache;

    const hasFeatureColor = (feature) => {
      if (feature) {
        return chart_color_blue_500.value;
      } else {
        return chart_color_black_100.value;
      }
    };

    return (<Level>
      <LevelItem><CacheFeature icon={<Spinner2Icon color={hasFeatureColor(cache.bounded)}/>}
                               tooltip={'Bounded'}/></LevelItem>
      <LevelItem><CacheFeature icon={<StorageDomainIcon color={hasFeatureColor(cache.indexed)}/>}
                               tooltip={'Indexed'}/></LevelItem>
      <LevelItem><CacheFeature icon={<SaveIcon color={hasFeatureColor(cache.persistent)}/>}
                               tooltip={'Persisted'}/></LevelItem>
      <LevelItem><CacheFeature icon={<ServiceIcon color={hasFeatureColor(cache.transactional)}/>}
                               tooltip={'Transactional'}/></LevelItem>
      <LevelItem><CacheFeature icon={<KeyIcon color={hasFeatureColor(cache.secured)}/>}
                               tooltip={'Secured'}/></LevelItem>
      <LevelItem><CacheFeature icon={<DegradedIcon color={hasFeatureColor(cache.hasRemoteBackup)}/>}
                               tooltip={'Has remote backups'}/></LevelItem>
    </Level>);
  };

  const CacheFeature: React.FunctionComponent<any> = (props) => {
    return (<LevelItem>
      <Tooltip position="right"
               content={
                 <div>{props.tooltip}</div>
               }>
        {props.icon}
      </Tooltip></LevelItem>);
  };

  const CacheType: React.FunctionComponent<any> = (props) => {
    return (<Label style={{backgroundColor: displayUtils.cacheTypeColor(props.type), marginRight: 15}}>
      {props.type}</Label>);
  };
  const [columns, setColumns] = useState(
    [{title: 'Name', transforms: [cellWidth(20)]},
      {title: 'Type', transforms: [cellWidth(10)]},
      {title: 'Features', transforms: [cellWidth(40)]},
      {title: 'Actions', transforms: [cellWidth('max')]}])
  ;
  const [rows, setRows] = useState<(string | any)[]>([]);

  useEffect(() => {
    let rows: { cells: (string | any)[] }[] = caches.map(cache => {
      return {
        cells: [cache.name,
          {title: <CacheType type={cache.type}/>},
          {title: <CacheFeatures cache={cache}/>},
          {title: <CacheActionLinks name={cache.name}/>}]
      };
    });
    setRows(rows);
  }, []);

  return (
    <Table aria-label="Sortable Table" cells={columns} rows={rows}>
      <TableHeader/>
      <TableBody/>
    </Table>
  );
};

export {CacheTableDisplay};
