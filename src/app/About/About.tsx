import * as React from 'react';
import {
  AboutModal,
  Button,
  ButtonVariant,
  Divider,
  Flex,
  FlexItem,
  Icon,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants
} from '@patternfly/react-core';
import icon from '!!url-loader!@app/assets/favicons/apple-touch-icon.png';
import {
  FacebookIcon,
  GithubIcon,
  OutlinedCommentsIcon,
  StackOverflowIcon,
  TwitterIcon
} from '@patternfly/react-icons';
import { global_spacer_lg } from '@patternfly/react-tokens';
import { useFetchVersion } from '@app/services/serverHook';
import { useTranslation } from 'react-i18next';

const About = (props: { isModalOpen: boolean; closeModal: () => void }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const { version } = useFetchVersion();

  const infinispanGithubLink = 'https://github.com/infinispan/';
  const infinispanZulipLink = 'https://infinispan.zulipchat.com/';
  const infinispanStackOverflowLink = 'https://stackoverflow.com/questions/tagged/?tagnames=infinispan&sort=newest';
  const infinispanTwitterLink = 'https://twitter.com/infinispan/';
  const infinispanFacebookLink = 'https://www.facebook.com/infinispan/';
  const description1 = t('welcome-page.description1', { brandname: brandname });
  const description2 = t('welcome-page.description2', { brandname: brandname });
  const license = t('welcome-page.license', { brandname: brandname });

  return (
    <AboutModal
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      trademark="Sponsored by Red Hat"
      brandImageSrc={icon}
      brandImageAlt={brandname + ' Logo'}
      productName={brandname}
    >
      <Stack>
        <StackItem style={{ paddingBottom: global_spacer_lg.value }}>
          <TextContent style={{ margin: '0.2rem 0' }}>
            <Text>{description1}</Text>
            <Text>{description2}</Text>
            <Text>{license}</Text>
          </TextContent>
        </StackItem>
        <StackItem style={{ paddingBottom: global_spacer_lg.value }}>
          <Divider />
        </StackItem>
        <StackItem style={{ paddingBottom: global_spacer_lg.value }}>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem component={TextListItemVariants.dt}>Version</TextListItem>
              <TextListItem component={TextListItemVariants.dd}>{version}</TextListItem>
            </TextList>
          </TextContent>
        </StackItem>
        <StackItem style={{ paddingBottom: global_spacer_lg.value }}>
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
                aria-label={'Twitter'}
                component={'a'}
                href={infinispanTwitterLink}
                variant={ButtonVariant.link}
                target="_blank"
              >
                <Icon size="md">
                  <TwitterIcon />
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
