export default {}
// import React from 'react';
// import { Meta } from '@storybook/react/types-6-0';
// import { Story } from '@storybook/react';
// import { ShaApplicationProvider, UiProvider } from '../../providers';
// import AuthContainer from '../authedContainer';
// import { GenericDetailsPage, GenericEditPage } from '../..';
// import { MemberResponse, useMembersGet, useMembersUpdate } from '../../apis/members';
// import { useState } from 'react';
// import DetailsViewHeaderControls from '../detailsViewHeaderControls';
// import { Tag } from 'antd';
// import moment from 'moment';
// import { IEditPageProps } from './editPage';

// export default {
//   title: 'Components/Palyground',
//   component: GenericDetailsPage,
// } as Meta;

// const id = '6743d48e-d67f-48ab-a3a2-10a32d448e08';

// const configurableFormProps = {
//   id,
// };

// const backendUrl = process.env.STORYBOOK_BASE_URL; // Just for configuring Storybook


// // Create a master template for mapping args to render the Button component
// const Template: Story<IEditPageProps> = () => {


//   return (
//     <ShaApplicationProvider backendUrl={backendUrl}>
//       <AuthContainer layout>
//         <UiProvider>
//           <Generi
//         </UiProvider>
//       </AuthContainer>
//     </ShaApplicationProvider>
//   );
// };

// export const Basic = Template.bind({});
// Basic.args = { ...configurableFormProps };

// export const IndexPage = Template.bind({});
// IndexPage.args = {
//   backendUrl: backendUrl,
//   formPath: '/indexTable',
// };
