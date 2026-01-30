import React, { useState } from 'react';
import { 
  Dropdown, 
  DropdownList, 
  DropdownItem, 
  MenuToggle, 
  ToolbarItem 
} from '@patternfly/react-core';
import { GlobeIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (_event, value) => {
    i18n.changeLanguage(value);
    setIsOpen(false);
  };

  const languages = {
    en: 'English',
    de: 'Deutsch',
    es: 'Español',
    fr: 'Français',
    it: 'Italiano',
    pt: 'Português',
    ja: '日本語',
    ar: 'العربية',
    hi: 'हिन्दी',
    zh: '中文'
  };

  const toggle = (toggleRef) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      variant="plainText" // or "plain" for icon-only
      icon={<GlobeIcon />}
    >
      {languages[i18n.language] || 'Language'}
    </MenuToggle>
  );

  return (
    <ToolbarItem>
      <Dropdown
        isOpen={isOpen}
        onSelect={onSelect}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        toggle={toggle}
        // In v6, alignment is often handled via popperProps if needed
        popperProps={{ position: 'right' }} 
      >
        <DropdownList>
          {Object.entries(languages).map(([code, name]) => (
            <DropdownItem value={code} key={code} itemId={code}>
              {name}
            </DropdownItem>
          ))}
        </DropdownList>
      </Dropdown>
    </ToolbarItem>
  );
};
export { LanguageSelector };
