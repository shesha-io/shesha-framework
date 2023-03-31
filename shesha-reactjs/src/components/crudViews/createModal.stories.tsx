import React from 'react';
import { GenericCreateModal, IGenericCreateModalProps } from '../..';
import { Story, Meta } from '@storybook/react';
import { useAreaCreate } from '../../apis/area';
import StoryApp from '../storyBookApp';

// #region Storybook Metadata & Configuration

export default {
  title: 'Components/CrudViews/CreateModal',
  component: GenericCreateModal
} as Meta;

// #endregion

// #region Base Mapping Template and Props

const BaseTemplate: Story<IGenericCreateModalProps> = props => {
  return (
    <StoryApp>
      <GenericCreateModal title={props.title} formId={props.formId} updater={props.updater} />
    </StoryApp>
  );
};

const baseProps: IGenericCreateModalProps = {
  title: 'Create Entity',
  formId: { name: 'area-create' },
  updater: useAreaCreate,
};

export const Base = BaseTemplate.bind({});
Base.args = { ...baseProps };

// #endregion
