import {
  Card,
  CardBody,
  CardHeader, FormSection, HelperText, HelperTextItem,
  Panel,
  PanelHeader,
  PanelMainBody,
  Text,
  TextContent,
  TextVariants
} from "@patternfly/react-core";
import React from "react";
import {useTranslation} from "react-i18next";

const FeatureCard = (props: { title?: string, computedTitle?: string, description?: string; children?: React.ReactNode}) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const title = props.computedTitle? props.computedTitle : props.title ? props.title: '';
  return (
    <FormSection title={props.computedTitle? props.computedTitle: t(title)}>
      {props.description &&
        <HelperText>
          <HelperTextItem>{t(props.description, { brandname: brandname })}</HelperTextItem>
        </HelperText>
      }
      {props.children}
    </FormSection>
  );
};
export { FeatureCard };
