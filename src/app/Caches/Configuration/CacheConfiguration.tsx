import React from 'react';
import {
  Card,
  CardBody,
  ClipboardCopy,
  ClipboardCopyVariant,
  Spinner,
} from '@patternfly/react-core';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const CacheConfiguration: React.FunctionComponent<any> = (props: {
  config: CacheConfig | undefined;
}) => {
  if (!props.config) {
    return <Spinner size={'md'} />;
  }

  return (
    <Card>
      <CardBody>
        <SyntaxHighlighter
          wrapLines={false}
          style={githubGist}
          useInlineStyles={true}
          showLineNumbers={true}
        >
          {props.config?.config}
        </SyntaxHighlighter>
        <ClipboardCopy isReadOnly isCode variant={ClipboardCopyVariant.inline}>
          {props.config?.config}
        </ClipboardCopy>
      </CardBody>
    </Card>
  );
};

export { CacheConfiguration };
