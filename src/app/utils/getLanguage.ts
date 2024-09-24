import { ConfigDownloadType } from '@services/infinispanRefData';
import { Language } from '@patternfly/react-code-editor';

export const toCodeEditorLanguage = (lang: ConfigDownloadType) => {
  if (ConfigDownloadType.JSON == lang) {
    return Language.json;
  }

  if (ConfigDownloadType.YAML == lang) {
    return Language.yaml;
  }

  if (ConfigDownloadType.XML == lang) {
    return Language.xml;
  }

  return Language.plaintext;
};
