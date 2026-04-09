import { SectionSeparator } from '@/components/sectionSeparator';
import { ISectionSeparatorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { FCUnwrapped } from '@/providers';
import React from 'react';

export const SectionSeparatorWrapper: FCUnwrapped<ISectionSeparatorSettingsInputProps> = (props) => <SectionSeparator {...props} />;
