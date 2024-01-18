import React from 'react';
import { Story } from '@storybook/react';
import { CurrencyConverter, ICurrencyConverterProps } from '@/components';
import StoryApp from '../storyBookApp';

// #region Storybook Metadata & Configuration

export default {
    title: 'Components/CurrencyConverter',
    component: CurrencyConverter
};

// #endregion

// #region Base Mapping Template and Props

const BaseTemplate: Story<ICurrencyConverterProps> = props => {
    return (
        <StoryApp>
            <CurrencyConverter {...props} />
        </StoryApp>
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