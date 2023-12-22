import React from 'react';
import { SettingsPage } from '@/generic-pages/settings-editor';
import { PageWithLayout } from '@/interfaces';
import { getLayout } from '@/components/mainLayout/index';



const Page: PageWithLayout<{}> = (props) => {
    return <SettingsPage {...props} />;
};

export default Page;

Page.getLayout = getLayout;
