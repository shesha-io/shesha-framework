import React from 'react';
import { Story } from '@storybook/react';
import ConfigurableForm from '..';
import { ISidebarMenuItem, ShaApplicationProvider, SidebarMenuDefaultsProvider } from '../../../providers';
import AuthContainer from '../../authedContainer';
import { MainLayout } from '../..';

export interface IIndexPageTemplateProps {
  backendUrl: string;
  formPath: string;
}
export const IndexPageTemplate: Story<IIndexPageTemplateProps> = props => {
  const defaultItems: ISidebarMenuItem[] = [
    {
      id: 'generalDashboard',
      itemType: 'button',
      buttonAction: 'navigate',
      title: 'General Dashboard',
      target: '/',
      icon: 'PieChartOutlined',
    },
    {
      id: 'administrationGroup',
      itemType: 'group',
      title: 'Administration',
      icon: 'AppstoreOutlined',
      childItems: [
        {
          id: 'users',
          itemType: 'button',
          buttonAction: 'navigate',
          title: 'User Management',
          target: '/users',
          icon: 'UserOutlined',
          //requiredPermissions: ['users'],
        },
        {
          id: 'maintenance',
          itemType: 'button',
          buttonAction: 'navigate',
          title: 'Maintenance',
          target: '/maintenance',
          icon: 'ToolOutlined',
          requiredPermissions: ['maintenance'],
          //isHidden: true, // remove after page fix
        },
      ],
    },
  ];
  return (
    <ShaApplicationProvider backendUrl={props.backendUrl}>
      <AuthContainer layout={true}>
        <SidebarMenuDefaultsProvider items={defaultItems}>
          <MainLayout title="Configurable index page">
            <ConfigurableForm
              mode="edit"
              path={props.formPath}
              actions={{
                test: () => {
                  console.log('test acton executed');
                },
                customSubmit: (values, actionArgs) => {
                  console.log({
                    msg: 'customSubmit',
                    values,
                    actionArgs,
                  });
                },
              }}
            />
          </MainLayout>
        </SidebarMenuDefaultsProvider>
      </AuthContainer>
    </ShaApplicationProvider>
  );
};
