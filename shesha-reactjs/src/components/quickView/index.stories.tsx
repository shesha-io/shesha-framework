import React from 'react';
import StoryApp from '@/components/storyBookApp';
import { Button } from 'antd';
import { GenericQuickView } from '.';
import { IQuickViewProps, QuickView } from '@/components';
import { Story } from '@storybook/react';

// #region Storybook Metadata & Configuration

export default {
  title: 'Components/QuickView',
  component: QuickView
};

// #endregion

// #region Base Mapping Template and Props

const BaseTemplate: Story<IQuickViewProps> = props => {
  return (
    <StoryApp>
      <GenericQuickView {...props}>
        <Button type="link">Hello</Button>
      </GenericQuickView>
    </StoryApp>
  );
};

const baseProps: IQuickViewProps = {
  entityId: 'B3B60F2E-5B88-4F44-B8EB-D3987A8483D9',
  className: 'Shesha.Domain.Person',
  displayName: 'Александр Степанцов',
  //formIdentifier: { name: 'person-details' },
  //getEntityUrl: '/api/dynamic/shesha/person/Get',
  displayProperty: "fullName",
  width: 800
};

export const Base = BaseTemplate.bind({});
Base.args = { ...baseProps };

const initialProps: IQuickViewProps = {
  initialFormData: { firstName: "Alex", lastName: "Stephens", fullName: "Full name" },
  className: 'Shesha.Domain.Person',
  displayName: 'Configured initial values',
  //formIdentifier: { name: 'person-details' },
  //getEntityUrl: '/api/dynamic/shesha/person/Get',
  displayProperty: "fullName",
  width: 800
};

export const Initial = BaseTemplate.bind({});
Initial.args = { ...initialProps };

// #endregion
