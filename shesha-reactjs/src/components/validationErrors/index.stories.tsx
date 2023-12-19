import React from 'react';
import { Story } from '@storybook/react';
import ValidationErrors, { IValidationErrorsProps } from './';
import { IErrorInfo } from '@/interfaces/errorInfo';

export default {
  title: 'Components/ValidationErrors',
  component: ValidationErrors,
  argTypes: {
    // backgroundColor: { control: 'color' },
    // label: {
    //   description: 'Overwritten description',
    //   table: {
    //     type: {
    //       summary: 'Something short',
    //       detail: 'Something really really long',
    //     },
    //   },
    //   control: {
    //     type: null,
    //   },
    // },
  }
};

const errorMessageOnly: IErrorInfo = {
  message: 'Please make sure you have entered the correct details',
};

const errorDetailsOnly: IErrorInfo = {
  details: 'These are the details of your error',
};

const errorMessageAndDetails: IErrorInfo = {
  message: 'Please make sure you have entered the correct details',
  details: 'These are the details of your error',
};

const errorMessageFull: IErrorInfo = {
  message: 'Please make sure you have entered the correct details',
  details: 'These are the details of your error',
  validationErrors: [
    { message: 'Validation error message 1' },
    { message: 'Validation error message 2' },
    { message: 'Validation error message 3' },
    { message: 'Validation error message 4' },
  ],
};

// Create a master template for mapping args to render the Button component
const Template: Story<IValidationErrorsProps> = args => <ValidationErrors {...args} />;

export const MessageOnly = Template.bind({});
MessageOnly.args = { label: 'Message only', error: errorMessageOnly };

export const DetailsOnly = Template.bind({});
DetailsOnly.args = { label: 'Details only', error: errorDetailsOnly };

export const ErrorAndDetails = Template.bind({});
ErrorAndDetails.args = { label: 'Error message and details', error: errorMessageAndDetails };

export const FullErrorMessage = Template.bind({});
FullErrorMessage.args = { label: 'Full error message', error: errorMessageFull };
