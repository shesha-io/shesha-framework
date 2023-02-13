import React, { FC } from 'react';
import { IFormComponent } from '../../../interfaces';
import DrillDown from './drillDown';
import StoredFile from './storedFile';
import QuickView from './quickView/index';

export const FormComponentEntityDisplay: FC<IFormComponent> = props => {
  const {
    dataType: { displayAs },
  } = props;

  if (displayAs === 'drill-down') return <DrillDown {...props} />;
  else if (displayAs === 'quick-view') return <QuickView {...props} />;

  return <StoredFile {...props} />;
};

export default FormComponentEntityDisplay;
