import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import CollapsibleSidebarContainer, { ICollapsibleSidebarContainerProps } from './';
import { Alert, Col, Row } from 'antd';
import CollapsiblePanel from '@/components/panel';
// import './styles/index.less';

export default {
  title: 'Components/CollapsibleSidebarContainer',
  component: CollapsibleSidebarContainer
} as Meta;

const LoremIpsum = () => (
  <p>
    Suspendisse aliquet placerat sagittis. Cras commodo, risus quis blandit fringilla, orci risus consequat arcu, at
    accumsan libero sapien eget magna. Vivamus scelerisque, augue a euismod bibendum, orci justo ultrices elit, eu
    tempor lacus massa vel leo. Aenean tincidunt imperdiet condimentum. Mauris tempor at purus in posuere. Sed
    pellentesque eu erat eu condimentum. Morbi pharetra neque vitae mollis elementum. Pellentesque blandit bibendum
    metus, a lobortis odio semper efficitur. Pellentesque scelerisque odio vitae nulla aliquam ultricies. Sed viverra
    sollicitudin tincidunt.
  </p>
);

const iconPickerProps: ICollapsibleSidebarContainerProps = {};

// Create a master template for mapping args to render the Button component
const Template: Story<ICollapsibleSidebarContainerProps> = args => {
  const [leftPanelOpen, setLeftPanelOpenState] = useState(false);
  const [rightPanelOpen, setRightPanelOpenState] = useState(false);

  const toggleLeftPanel = () => setLeftPanelOpenState(open => !open);
  const toggleRightPanel = () => setRightPanelOpenState(open => !open);

  return (
    <div className="test">
      <Row>
        <Col span={24}>
          <CollapsiblePanel header="Basic panel">
            <CollapsibleSidebarContainer
              leftSidebarProps={{
                title: 'Left Heading',
                content: () => <Alert message={`Title`} description="This will be the main body" />,
                open: leftPanelOpen,
                onOpen: toggleLeftPanel,
                onClose: toggleLeftPanel,
              }}
              rightSidebarProps={{
                title: 'Right Heading',
                content: () => <Alert message={`Title`} description="This will be the main body" />,
                open: rightPanelOpen,
                onOpen: toggleRightPanel,
                onClose: toggleRightPanel,
              }}
              {...args}
            >
              <LoremIpsum />
            </CollapsibleSidebarContainer>
          </CollapsiblePanel>
        </Col>
      </Row>
    </div>
  );
};

export const BasicIconPicker = Template.bind({});
BasicIconPicker.args = { label: 'Message only', ...iconPickerProps };
