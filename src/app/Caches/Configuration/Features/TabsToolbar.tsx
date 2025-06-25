import { Button, ButtonVariant, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { t_global_spacer_md } from '@patternfly/react-tokens';
import { Link, useParams } from 'react-router-dom';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

const TabsToolbar = (props: { id: string; saveAction: () => void; cancelAction: () => void }) => {
  const { t } = useTranslation();
  const cacheName = useParams()['cacheName'] as string;
  return (
    <Toolbar id={`edit-${props.id}-config-page-toolbar`}>
      <ToolbarContent style={{ paddingLeft: 0, paddingTop: t_global_spacer_md.value }}>
        <ToolbarItem>
          <Button
            variant={ButtonVariant.primary}
            data-cy={`saveConfigButton-${props.id}`}
            onClick={() => props.saveAction()}
          >
            {t('common.actions.save')}
          </Button>
        </ToolbarItem>
        <ToolbarItem>
          <Button
            variant={ButtonVariant.secondary}
            ata-cy={`cancelButton-${props.id}`}
            onClick={() => props.cancelAction()}
          >
            {t('common.actions.cancel')}
          </Button>
        </ToolbarItem>
        <ToolbarItem>
          <Link
            to={{
              pathname: '/cache/' + encodeURIComponent(cacheName),
              search: location.search
            }}
          >
            <Button variant={ButtonVariant.link} data-cy={`backButton-${props.id}`}>
              {t('common.actions.back')}
            </Button>
          </Link>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export { TabsToolbar };
