import React from 'react';
import { Story } from '@storybook/react';
import StoryApp from '@/components/storyBookApp';
import { EntityReference, IEntityReferenceProps } from '.';
import { DynamicModalProvider } from '@/components/..';

// #region Storybook Metadata & Configuration

export default {
  title: 'Components/EntityReference',
  component: EntityReference
};

// #endregion

// #region Base Mapping Template and Props

const BaseTemplate: Story<IEntityReferenceProps> = props => {
  return (
    <StoryApp>
        <DynamicModalProvider>
            <EntityReference {...props} />
        </DynamicModalProvider>
    </StoryApp>
  );
};

const quickViewProps: IEntityReferenceProps = {
    formSelectionMode: 'name',
    placeholder: "Test entity reference",
    entityReferenceType: 'Quickview',
    formIdentifier: { name: 'person-edit', module: 'Test Module', version: 1 },
    formType: 'quickview',
    //entityType: 'Shesha.Core.Person',
    displayProperty: 'fullName',
    //getEntityUrl: '/api/dynamic/Shesha/Person/Get',
    //value: "B3B60F2E-5B88-4F44-B8EB-D3987A8483D9",
    value: { id: "B3B60F2E-5B88-4F44-B8EB-D3987A8483D9", _className: "Shesha.Domain.Person", _displayName: "Шурик" },
    handleSuccess: false,
    handleFail: false
};

export const QuickView = BaseTemplate.bind({});
QuickView.args = { ...quickViewProps };

const navigateProps: IEntityReferenceProps = {
    formSelectionMode: 'name',
    placeholder: "Test entity reference",
    entityReferenceType: 'NavigateLink',
    formIdentifier: { name: 'person-edit', module: 'Test Module', version: 1 },
    //formType: 'Details',
    displayProperty: 'fullName',
    //getEntityUrl: '/api/dynamic/Shesha/Person/Get',
    //value: "B3B60F2E-5B88-4F44-B8EB-D3987A8483D9"
    value: { id: "B3B60F2E-5B88-4F44-B8EB-D3987A8483D9", _className: "Shesha.Domain.Person", _displayName: "Шурик" },
    handleSuccess: false,
    handleFail: false
};

export const Navigate = BaseTemplate.bind({});
Navigate.args = { ...navigateProps };

const dialogProps: IEntityReferenceProps = {
    formSelectionMode: 'name',
    placeholder: "Test entity reference",
    entityReferenceType: 'Dialog',
    formIdentifier: { name: 'person-edit', module: 'Test Module', version: 1 },
    //formType: 'quickview',
    displayProperty: 'fullName',
    //getEntityUrl: '/api/dynamic/Shesha/Person/Get',
    //value: "B3B60F2E-5B88-4F44-B8EB-D3987A8483D9"
    value: { id: "B3B60F2E-5B88-4F44-B8EB-D3987A8483D9", _className: "Shesha.Domain.Person", _displayName: "Шурик" },
    handleSuccess: false,
    handleFail: false
};

export const Dialog = BaseTemplate.bind({});
Dialog.args = { ...dialogProps };


// #endregion
