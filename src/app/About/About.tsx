import * as React from 'react';
import { useEffect } from 'react';
import {
  AboutModal,
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  Divider,
  Flex,
  FlexItem,
  Icon,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import icon from '!!url-loader!@app/assets/favicons/ms-icon-310x310.png';

import {
  FacebookIcon,
  GithubIcon,
  OutlinedCommentsIcon,
  StackOverflowIcon,
} from '@patternfly/react-icons';
import { useFetchVersion } from '@app/hooks/serverHook';
import { useTranslation } from 'react-i18next';
import './About.css';

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    width="1em"
    height="1em"
  >
    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
  </svg>
);

const About = (props: { isModalOpen: boolean; closeModal: () => void }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { version, loading, setLoading } = useFetchVersion();

  const infinispanGithubLink = 'https://github.com/infinispan/';
  const infinispanZulipLink = 'https://infinispan.zulipchat.com/';
  const infinispanStackOverflowLink =
    'https://stackoverflow.com/questions/tagged/?tagnames=infinispan&sort=newest';
  const infinispanXLink = 'https://x.com/infinispan/';
  const infinispanFacebookLink = 'https://www.facebook.com/infinispan/';
  const description1 = t('welcome-page.description1', { brandname: brandname });
  const description2 = t('welcome-page.description2', { brandname: brandname });
  const license = t('welcome-page.license', { brandname: brandname });
  const apacheLicense = t('welcome-page.apache-license');

  useEffect(() => {
    if (props.isModalOpen && version == '') {
      setLoading(true);
    }
  }, [props.isModalOpen]);

  return (
    <AboutModal
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      trademark="Sponsored by Red Hat"
      brandImageSrc={icon}
      brandImageAlt={brandname + ' Logo'}
      productName={brandname}
    >
      <Stack hasGutter>
        <StackItem>
          <Content component={ContentVariants.p}>{description1}</Content>
          <Content component={ContentVariants.p}>{description2}</Content>
          <Content component={ContentVariants.p}>
            {license}
            {apacheLicense}
          </Content>
        </StackItem>
        <StackItem>
          <Divider />
        </StackItem>
        <StackItem>
          <Content component={ContentVariants.dl}>
            <Content component={ContentVariants.dt}>Version</Content>
            <Content component={ContentVariants.dd}>
              {' '}
              {loading ? <Spinner size={'sm'} /> : version}
            </Content>
          </Content>
        </StackItem>
        <StackItem>
          <Divider />
        </StackItem>
        <StackItem>
          <Flex>
            <FlexItem>
              <Button
                aria-label={'Github'}
                component={'a'}
                href={infinispanGithubLink}
                variant={ButtonVariant.link}
                target="_blank"
              >
                <Icon size="md">
                  <GithubIcon />
                </Icon>
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                aria-label={'Zulip'}
                component={'a'}
                href={infinispanZulipLink}
                variant={ButtonVariant.link}
                target="_blank"
              >
                <Icon size="md">
                  <OutlinedCommentsIcon />
                </Icon>
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                aria-label={'Stackoverflow'}
                component={'a'}
                href={infinispanStackOverflowLink}
                variant={ButtonVariant.link}
                target="_blank"
              >
                <Icon size="md">
                  <StackOverflowIcon />
                </Icon>
              </Button>
            </FlexItem>

            <FlexItem>
              <Button
                aria-label={'X'}
                component={'a'}
                href={infinispanXLink}
                variant={ButtonVariant.link}
                target="_blank"
              >
                <Icon size="md">
                  <XIcon />
                </Icon>
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                aria-label={'Facebook'}
                component={'a'}
                href={infinispanFacebookLink}
                variant={ButtonVariant.link}
                target="_blank"
              >
                <Icon size="md">
                  <FacebookIcon />
                </Icon>
              </Button>
            </FlexItem>
          </Flex>
        </StackItem>
      </Stack>
    </AboutModal>
  );
};

export { About };
