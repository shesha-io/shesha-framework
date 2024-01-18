import React from 'react';
import { addStory } from '@/stories/utils';
import { FormProvider } from '@/providers';
import { PermissionsTree, PermissionsTreeMode } from '.';
import { Story } from '@storybook/react';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/PermissionsTree',
  component: PermissionsTree
};

export interface IPermissionTreeStoryProps {
  value?: string[];
  updateKey?: string;
  onChange?: (values?: string[]) => void;
  /**
   * Whether this control is disabled
   */
  disabled?: boolean;
  /**
   * If true, the automplete will be in read-only mode. This is not the same sa disabled mode
   */
  readOnly?: boolean;
  height?: number;
  mode: PermissionsTreeMode;
}

const Template: Story<IPermissionTreeStoryProps> = (props) => {
  return (
    <StoryApp>
      <FormProvider mode={'edit'} name={''} allComponents={{}} componentRelations={{}} formSettings={undefined} isActionsOwner={false}>
        <PermissionsTree formComponentName={''} formComponentId={''} {...props} />
      </FormProvider>
    </StoryApp>
  );
};

export const Base = addStory(Template, {
  mode: 'Select'
});