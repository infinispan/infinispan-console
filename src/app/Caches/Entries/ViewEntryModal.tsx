import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Modal,
  ModalVariant,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Alert,
  AlertVariant,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { ContentType } from '@services/infinispanRefData';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { ThemeContext } from '@app/providers/ThemeProvider';
import displayUtils from '@services/displayUtils';

interface ViewEntryModalProps {
  cacheName: string;
  entryKey: string;
  keyContentType: ContentType;
  cacheEncoding: CacheEncoding;
  isModalOpen: boolean;
  closeModal: () => void;
}

const ViewEntryModal = (props: ViewEntryModalProps) => {
  const { t } = useTranslation();
  const { syntaxHighLighterTheme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [entry, setEntry] = useState<CacheEntry | undefined>(undefined);

  useEffect(() => {
    if (props.isModalOpen) {
      loadEntry();
    }
  }, [props.isModalOpen, props.entryKey]);

  const loadEntry = () => {
    setLoading(true);
    setError(undefined);
    
    ConsoleServices.caches()
      .getEntry(props.cacheName, props.cacheEncoding, props.entryKey, props.keyContentType)
      .then((response) => {
        if (response.isRight()) {
          const entries = response.value;
          if (entries && entries.length > 0) {
            setEntry(entries[0]);
          } else {
            setError(t('caches.entries.entry-not-found'));
          }
        } else {
          setError(response.value.message);
        }
      })
      .catch((err) => {
        setError(err.message || t('caches.entries.error-loading-entry'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const displayValue = () => {
    if (loading) {
      return <Spinner size="lg" />;
    }

    if (error) {
      return (
        <Alert variant={AlertVariant.danger} isInline title={t('caches.entries.error-title')}>
          {error}
        </Alert>
      );
    }

    if (!entry) {
      return (
        <Alert variant={AlertVariant.warning} isInline title={t('caches.entries.no-entry')}>
          {t('caches.entries.entry-not-found')}
        </Alert>
      );
    }

    return (
      <DescriptionList isHorizontal>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('caches.entries.column-key')}</DescriptionListTerm>
          <DescriptionListDescription>
            <SyntaxHighlighter
              language="json"
              lineProps={{ style: { wordBreak: 'break-all' } }}
              style={syntaxHighLighterTheme}
              useInlineStyles={true}
              wrapLongLines={true}
            >
              {displayUtils.formatContentToDisplay(entry.key, entry.keyContentType as ContentType)}
            </SyntaxHighlighter>
          </DescriptionListDescription>
        </DescriptionListGroup>
        
        <DescriptionListGroup>
          <DescriptionListTerm>{t('caches.entries.column-value')}</DescriptionListTerm>
          <DescriptionListDescription>
            <SyntaxHighlighter
              language="json"
              lineProps={{ style: { wordBreak: 'break-all' } }}
              style={syntaxHighLighterTheme}
              useInlineStyles={true}
              wrapLongLines={true}
            >
              {displayUtils.formatContentToDisplay(entry.value, entry.valueContentType as ContentType)}
            </SyntaxHighlighter>
          </DescriptionListDescription>
        </DescriptionListGroup>

        {entry.timeToLive && (
          <DescriptionListGroup>
            <DescriptionListTerm>{t('caches.entries.column-lifespan')}</DescriptionListTerm>
            <DescriptionListDescription>{entry.timeToLive}</DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {entry.maxIdle && (
          <DescriptionListGroup>
            <DescriptionListTerm>{t('caches.entries.column-maxidle')}</DescriptionListTerm>
            <DescriptionListDescription>{entry.maxIdle}</DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {entry.expires && (
          <DescriptionListGroup>
            <DescriptionListTerm>{t('caches.entries.column-expires')}</DescriptionListTerm>
            <DescriptionListDescription>{entry.expires}</DescriptionListDescription>
          </DescriptionListGroup>
        )}
      </DescriptionList>
    );
  };

  return (
    <Modal
      variant={ModalVariant.large}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      aria-label={t('caches.entries.view-entry-title')}
    >
      <ModalHeader title={t('caches.entries.view-entry-title')} />
      <ModalBody>
        {displayValue()}
      </ModalBody>
      <ModalFooter>
        <Button key="close" variant="primary" onClick={props.closeModal}>
          {t('caches.entries.close-button')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { ViewEntryModal };

// Made with Bob
