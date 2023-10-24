import { useTranslation } from 'react-i18next';

const RoleCaches = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  return 'Caches';
};

export { RoleCaches };
