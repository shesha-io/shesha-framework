import React from 'react';
import { GenericCreateModal, IGenericCreateModalProps } from '../..';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import { useAreaCreate } from '../../apis/area';
import StoryApp from '../storyBookApp';

// #region Storybook Metadata & Configuration

export default {
  title: 'Components/CrudViews/CreateModal',
  component: GenericCreateModal,
} as Meta;

// #endregion

// #region Base Mapping Template and Props

const BaseTemplate: Story<IGenericCreateModalProps> = props => {
  return (
    <StoryApp>
      <GenericCreateModal title={props.title} formPath={props.formPath} updater={props.updater} />
    </StoryApp>
  );
};

const baseProps: IGenericCreateModalProps = {
  title: 'Create Entity',
  formPath: '/areas/create',
  updater: useAreaCreate,
};

export const Base = BaseTemplate.bind({});
Base.args = { ...baseProps };

// #endregion
