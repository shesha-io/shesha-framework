import React from 'react';
import { Story } from '@storybook/react';
import { Meta } from '@storybook/react/types-6-0';
import AuthContainer from '../authedContainer';
import { ShaApplicationProvider } from '../../providers';
import { CurrencyConverter, ICurrencyConverterProps, GlobalStateProvider } from '../..';

// #region Storybook Metadata & Configuration

export default {
    title: 'Components/CurrencyConverter',
    component: CurrencyConverter,
} as Meta;

const backendUrl = process.env.STORYBOOK_BASE_URL;

// #endregion

// #region Base Mapping Template and Props

const BaseTemplate: Story<ICurrencyConverterProps> = props => {
    return (
        <GlobalStateProvider>
            <ShaApplicationProvider backendUrl={backendUrl}>
                <AuthContainer layout>
                    <CurrencyConverter {...props} />
                </AuthContainer>
            </ShaApplicationProvider>
        </GlobalStateProvider>
    );
};

const baseProps: ICurrencyConverterProps = {
    from: 'USD',
    to: 'ZAR',
    rate: 15
};

export const Base = BaseTemplate.bind({});
Base.args = { ...baseProps };

// #endregion