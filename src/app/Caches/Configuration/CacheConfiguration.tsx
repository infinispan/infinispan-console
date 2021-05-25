import React from 'react';
import {
  Alert, AlertActionLink, AlertVariant, Button,
  Card,
  CardBody, CardHeader,
  ClipboardCopy,
  ClipboardCopyVariant,
  Spinner,
} from '@patternfly/react-core';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTranslation } from 'react-i18next';

const CacheConfiguration = (props: {
  cache: DetailedInfinispanCache | undefined;
}) => {
  const { t } = useTranslation();
  const encodingDocs = t('brandname.encoding-docs-link');
  if (!props.cache) {
    return (
      <Spinner size={'md'} />
    );
  }

  const displayHeaderAlert = () => {
    if(props.cache?.editable) {
      return '';
    }

    return (
      <CardHeader>
        <Alert isInline title={'You cannot read or edit this cache content from the console. To read or edit caches content, you must define an encoding.'}
               variant={AlertVariant.warning}
               actionLinks={
                   <AlertActionLink onClick={() => window.open(encodingDocs, "_blank")}>
                     See "Cache Encoding and Marshalling" for more information</AlertActionLink>
               }
        />

      </CardHeader>
    );
  };

  return (
    <Card>
      {displayHeaderAlert()}
      <CardBody>
        <SyntaxHighlighter
          wrapLines={false}
          style={githubGist}
          useInlineStyles={true}
          showLineNumbers={true}
        >
          {props.cache.configuration.config}
        </SyntaxHighlighter>
        <ClipboardCopy isReadOnly isCode variant={ClipboardCopyVariant.inline}>
          {props.cache.configuration.config}
        </ClipboardCopy>
      </CardBody>
    </Card>
  );
};

export { CacheConfiguration };
