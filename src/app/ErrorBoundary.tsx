import React from 'react';
import {
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import { TableErrorState } from '@app/Common/TableErrorState';

interface ErrorBoundaryProps {
  hasError: boolean;
  error: string;
}

class ErrorBoundary extends React.Component<NonNullable<unknown>, ErrorBoundaryProps> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error.toString() };
  }

  componentDidCatch(error, info) {
    // You can also log the error to an error reporting service
    console.log(error, info);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <React.Fragment>
          <PageSection variant={PageSectionVariants.light} style={{ paddingBottom: 0 }}>
            <Toolbar id="console-error-header">
              <ToolbarGroup>
                <ToolbarContent style={{ paddingLeft: 0 }}>
                  <ToolbarItem>
                    <TextContent>
                      <Text component={TextVariants.h1}>Web console error</Text>
                    </TextContent>
                  </ToolbarItem>
                </ToolbarContent>
              </ToolbarGroup>
            </Toolbar>
          </PageSection>
          <PageSection>
            <TableErrorState error={'Something went wrong'} detail={this.state.error} />
          </PageSection>
        </React.Fragment>
      );
    }

    // If there is no error just render the children component.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.props.children;
  }
}

export { ErrorBoundary };
