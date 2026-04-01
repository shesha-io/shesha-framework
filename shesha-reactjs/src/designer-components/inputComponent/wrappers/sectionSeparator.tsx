import { SectionSeparator } from '@/components';
import { ISectionSeparatorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { FCUnwrapped } from '@/index';
import React from 'react';

export const SectionSeparatorWrapper: FCUnwrapped<ISectionSeparatorSettingsInputProps> = (props) => <SectionSeparator {...props} />;
