import React from 'react';
import { QuickView, IQuickViewProps } from '../..';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import { Button } from 'antd';
import StoryApp from '../storyBookApp';

// #region Storybook Metadata & Configuration

export default {
  title: 'Components/QuickView',
  component: QuickView,
} as Meta;

// #endregion

// #region Base Mapping Template and Props

const BaseTemplate: Story<IQuickViewProps> = props => {
  return (
    <StoryApp>
      <QuickView {...props}>
        <Button type="link">Hello</Button>
      </QuickView>
    </StoryApp>
  );
};

const baseProps: IQuickViewProps = {
  entityId: '0cdad6b0-a3b2-4cf6-9b7d-238d753f0657',
  formIdentifier: { name: 'quickview-his-health-facilities-details'},
  getEntityUrl: '/api/services/Common/HisHealthFacility/Get',
  displayProperty: null,
};

export const Base = BaseTemplate.bind({});
Base.args = { ...baseProps };

const personProps: IQuickViewProps = {
  entityId: 'B3B60F2E-5B88-4F44-B8EB-D3987A8483D9',
  formIdentifier: { name: '/persons/edit', version: 2, },
  getEntityUrl: '/api/services/app/person/Get',
  displayProperty: "fullName",
  width: 800
};

export const Person = BaseTemplate.bind({});
Base.args = { ...personProps };


// #endregion
