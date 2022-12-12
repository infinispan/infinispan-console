import { CacheFeature, EncodingType, CacheMode } from '@services/infinispanRefData';

export function validFeatures(configuration: CacheConfiguration): boolean {
  return (
    validateFeature(CacheFeature.BOUNDED, 'boundedCache', configuration) &&
    validateFeature(CacheFeature.INDEXED, 'indexedCache', configuration) &&
    validateFeature(CacheFeature.SECURED, 'securedCache', configuration) &&
    validateFeature(CacheFeature.BACKUPS, 'backupsCache', configuration) &&
    validateFeature(CacheFeature.TRANSACTIONAL, 'transactionalCache', configuration) &&
    validateFeature(CacheFeature.PERSISTENCE, 'persistentCache', configuration)
  );
}

function validateFeature(feature: CacheFeature, property: string, configuration: CacheConfiguration): boolean {
  if (configuration.feature.cacheFeatureSelected.includes(feature)) {
    return configuration.feature[property].valid;
  }
  return true;
}

export function validateIndexedFeature(configuration: CacheConfiguration, encoding: string): boolean {
  if (configuration.feature.cacheFeatureSelected.includes(CacheFeature.INDEXED))
    return configuration.feature.indexedCache.indexedEntities.length > 0 && encoding === EncodingType.Protobuf;

  return true;
}

export function validateTransactionalFeature(configuration: CacheConfiguration, mode: string): boolean {
  if (configuration.feature.cacheFeatureSelected.includes(CacheFeature.TRANSACTIONAL)) return mode === CacheMode.SYNC;

  return true;
}
