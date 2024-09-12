import { EncodingType } from '@services/infinispanRefData';

export function isEncodingAvailable(cache: DetailedInfinispanCache): boolean {
  return (
    cache?.encoding !== undefined &&
    (cache?.encoding?.key !== EncodingType.Empty || cache?.encoding?.value !== EncodingType.Empty)
  );
}
