import {Alert, AlertActionLink, AlertVariant} from "@patternfly/react-core";
import React from "react";
import {CacheFeature} from "@services/infinispanRefData";
import {useTranslation} from "react-i18next";
import {useCreateCache} from "@app/services/createCacheHook";

const FeatureAlert = (props: {feature: CacheFeature}) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { removeFeature } = useCreateCache();
  return (
    <Alert variant={AlertVariant.info}
           isInline
           isPlain
           title={t('caches.create.configurations.feature.' + props.feature.toLowerCase() + '-disabled')}
           actionLinks={
             <React.Fragment>
               <AlertActionLink onClick={() => removeFeature(props.feature) }>
                 {t('caches.create.configurations.feature.remove')}
               </AlertActionLink>
             </React.Fragment>
           }>
      {t('caches.create.configurations.feature.' + props.feature.toLowerCase() + '-disabled-description', { brandname: brandname })}
    </Alert>
  );
};
export { FeatureAlert };
