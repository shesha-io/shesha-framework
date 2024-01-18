import React, { FC } from 'react';
import { DesignerMainArea } from './designerMainArea/index';
import { DesignerTitle } from './designerTitle/index';
import { FormDesignerToolbar } from './toolbar/formDesignerToolbar';
import { useStyles } from './styles/styles';

export const FormDesignerRenderer: FC = ({ }) => {
  const { styles } = useStyles();
  return (
    <div className="sha-page">
      <div className="sha-page-heading">
        <div className="sha-page-title" style={{ justifyContent: 'left' }}>
          <DesignerTitle />
        </div>
      </div>
      <div className={styles.formDesigner}>
        <FormDesignerToolbar />
        <DesignerMainArea />
      </div>
    </div>
  );
};