import React, { FC } from 'react';
import { DesignerMainArea } from './designerMainArea/index';
import { DesignerTitle } from './designerTitle/index';
import { FormDesignerToolbar } from './toolbar/formDesignerToolbar';

export const FormDesignerRenderer: FC = ({ }) => {
  return (
    <div className="sha-page">
      <div className="sha-page-heading">
        <div className="sha-page-title" style={{ justifyContent: 'left' }}>
          <DesignerTitle />
        </div>
      </div>
      <div className="sha-form-designer">
        <FormDesignerToolbar />
        <DesignerMainArea />
      </div>
    </div>
  );
};