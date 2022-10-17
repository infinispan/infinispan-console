import { CacheFeature } from '@services/infinispanRefData';

export function validFeatures(configuration: CacheConfiguration): boolean {
  return (
    validateFeature(CacheFeature.BOUNDED, 'boundedCache', configuration) &&
    validateFeature(CacheFeature.INDEXED, 'indexedCache', configuration) &&
    validateFeature(CacheFeature.SECURED, 'securedCache', configuration) &&
    validateFeature(CacheFeature.BACKUPS, 'backupsCache', configuration) &&
    validateFeature(
      CacheFeature.TRANSACTIONAL,
      'transactionalCache',
      configuration
    ) &&
    validateFeature(CacheFeature.PERSISTENCE, 'persistentCache', configuration)
  );
}

function validateFeature(
  feature: CacheFeature,
  property: string,
  configuration: CacheConfiguration
): boolean {
  if (configuration.feature.cacheFeatureSelected.includes(feature)) {
    return configuration.feature[property].valid;
  }
  return true;
}
