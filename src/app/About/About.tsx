import * as React from 'react';
import {
  AboutModal,
  Button,
  ButtonVariant,
  Divider,
  Flex,
  FlexItem,
  Stack,
  StackItem,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';
import backImage from '!!url-loader!@app/assets/images/infinispanbg_1200.png';
import icon from '!!url-loader!@app/assets/images/brand.svg';
import {
  FacebookIcon,
  GithubIcon,
  OutlinedCommentsIcon,
  StackOverflowIcon,
  TwitterIcon,
} from '@patternfly/react-icons';
import { global_spacer_3xl, global_spacer_lg } from '@patternfly/react-tokens';
import { useFetchVersion } from '@app/services/serverHook';
import { useEffect } from 'react';

const About = (props: { isModalOpen: boolean; closeModal: () => void }) => {
  const { loading, version, error, setLoading } = useFetchVersion();
  const infinispanGithubLink = 'https://github.com/infinispan/';
  const infinispanZulipLink = 'https://infinispan.zulipchat.com/';
  const infinispanStackOverflowLink =
    'https://stackoverflow.com/questions/tagged/?tagnames=infinispan&sort=newest';
  const infinispanTwitterLink = 'https://twitter.com/infinispan/';
  const infinispanFacebookLink = 'https://www.facebook.com/infinispan/';

  useEffect(() => {
    if (props.isModalOpen) {
      setLoading(true);
    }
  }, [props.isModalOpen]);

  return (
    <AboutModal
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      trademark="Sponsored by Red Hat"
      brandImageSrc={icon}
      brandImageAlt="Infinispan Logo"
      backgroundImageSrc={backImage}
      disableFocusTrap={true}
    >
      <Stack>
        <StackItem style={{ paddingBottom: global_spacer_lg.value }}>
          <Divider />
        </StackItem>
        <StackItem style={{ paddingBottom: global_spacer_lg.value }}>
          <TextContent>
            <TextList component={TextListVariants.dl}>
              <TextListItem component={TextListItemVariants.dt}>
                Version
              </TextListItem>
              <TextListItem component={TextListItemVariants.dd}>
                {version}
              </TextListItem>
            </TextList>
          </TextContent>
        </StackItem>
        <StackItem>
          <Divider />
        </StackItem>
        <StackItem style={{ paddingTop: global_spacer_3xl.value }}>
          <Flex>
            <FlexItem>
              <Button
                component={'a'}
                href={infinispanGithubLink}
                variant={ButtonVariant.link}
              >
                <GithubIcon size={'lg'} />
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                component={'a'}
                href={infinispanZulipLink}
                variant={ButtonVariant.link}
              >
                <OutlinedCommentsIcon size={'lg'} />
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                component={'a'}
                href={infinispanStackOverflowLink}
                variant={ButtonVariant.link}
              >
                <StackOverflowIcon size={'lg'} />
              </Button>
            </FlexItem>

            <FlexItem>
              <Button
                component={'a'}
                href={infinispanTwitterLink}
                variant={ButtonVariant.link}
              >
                <TwitterIcon size={'lg'} />
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                component={'a'}
                href={infinispanFacebookLink}
                variant={ButtonVariant.link}
              >
                <FacebookIcon size={'lg'} />
              </Button>
            </FlexItem>
          </Flex>
        </StackItem>
      </Stack>
    </AboutModal>
  );
};

export { About };
