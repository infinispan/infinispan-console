import React, { useCallback, useState } from 'react';
import {
  CacheFeature,
  CacheMode,
  CacheType,
  EncodingType,
  EvictionStrategy,
  EvictionType,
  IndexingMode,
  IndexedStartupMode,
  IndexedStorage,
  IsolationLevel,
  Locking,
  MaxSizeUnit,
  TimeUnits,
  TransactionalMode
} from '@services/infinispanRefData';

const GettingStartedInitialState: GettingStartedState = {
  cacheName: '',
  createType: 'configure',
  valid: false
};

const BasicCacheConfigInitialState: BasicCacheConfig = {
  topology: CacheType.Distributed,
  mode: CacheMode.SYNC,
  numberOfOwners: 2,
  encoding: EncodingType.Protobuf,
  statistics: true,
  expiration: false,
  lifeSpanNumber: -1,
  lifeSpanUnit: TimeUnits.milliseconds,
  maxIdleNumber: -1,
  maxIdleUnit: TimeUnits.milliseconds,
  valid: false
};

const BoundedCacheInitialState: BoundedCache = {
  evictionType: EvictionType.size,
  maxSize: 0,
  maxCount: 0,
  evictionStrategy: EvictionStrategy.REMOVE,
  maxSizeUnit: MaxSizeUnit.MB,
  valid: true
};

const IndexWriterInitialState: IndexWriter = {};

const IndexMergeInitialState: IndexMerge = {};

const IndexedCacheInitialState: IndexedCache = {
  indexingMode: IndexingMode.auto,
  indexedStorage: IndexedStorage.persistent,
  indexedStartupMode: IndexedStartupMode.auto,
  indexedEntities: [],
  valid: true
};

const SecuredCacheInitialState: SecuredCache = {
  roles: [],
  valid: true
};

const BackupsCacheInitialState: BackupsCache = {
  sites: [],
  backupFor: {
    enabled: false,
    remoteSite: '',
    remoteCache: ''
  },
  valid: false
};

const BackupSettingInitialState: BackupSetting = {};

const TransactionalCacheInitialState: TransactionalCache = {
  mode: TransactionalMode.NON_XA,
  locking: Locking.OPTIMISTIC,
  valid: true
};

const TransactionalCacheAdvanceInitialState: TransactionalCacheAdvance = {
  isolationLevel: IsolationLevel.REPEATABLE_READ
};

const PersistentCacheInitialState: PersistentCache = {
  storage: '',
  config: '',
  passivation: false,
  valid: false,
  connectionAttempts: undefined,
  connectionInterval: undefined,
  availabilityInterval: undefined
};

const CacheFeatureInitialState: CacheFeatureStep = {
  cacheFeatureSelected: [],
  boundedCache: BoundedCacheInitialState,
  indexedCache: IndexedCacheInitialState,
  securedCache: SecuredCacheInitialState,
  backupsCache: BackupsCacheInitialState,
  transactionalCache: TransactionalCacheInitialState,
  persistentCache: PersistentCacheInitialState
};

const AdvancedOptionsInitialState: AdvancedConfigurationStep = {
  indexWriter: IndexWriterInitialState,
  indexMerge: IndexMergeInitialState,
  backupSetting: BackupSettingInitialState,
  transactionalAdvance: TransactionalCacheAdvanceInitialState,
  valid: true
};

const cacheConfigurationInitialState: CacheConfiguration = {
  start: GettingStartedInitialState,
  basic: BasicCacheConfigInitialState,
  feature: CacheFeatureInitialState,
  advanced: AdvancedOptionsInitialState
};

const initialContext = {
  configuration: cacheConfigurationInitialState,
  setConfiguration: (value: ((prevState: CacheConfiguration) => CacheConfiguration) | CacheConfiguration) => {},
  addFeature: (feature: CacheFeature) => {},
  removeFeature: (feature: CacheFeature) => {}
};

export const CreateCacheContext = React.createContext(initialContext);

const CreateCacheProvider = ({ children }) => {
  const [configuration, setConfiguration] = useState<CacheConfiguration>(initialContext.configuration);

  const removeFeature = (feature: CacheFeature) => {
    const features = configuration.feature.cacheFeatureSelected.filter((item) => item !== feature);
    setConfiguration((prevState) => {
      return {
        ...prevState,
        feature: {
          ...prevState.feature,
          cacheFeatureSelected: features
        }
      };
    });
  };

  const addFeature = (feature: CacheFeature) => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        feature: {
          ...prevState.feature,
          cacheFeatureSelected: [...configuration.feature.cacheFeatureSelected, feature]
        }
      };
    });
  };

  const contextValue = {
    configuration: configuration,
    setConfiguration: setConfiguration,
    addFeature: addFeature,
    removeFeature: removeFeature
  };

  return <CreateCacheContext.Provider value={contextValue}>{children}</CreateCacheContext.Provider>;
};

export { CreateCacheProvider };
