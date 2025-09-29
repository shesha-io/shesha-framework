import React, { FC } from 'react';
import { DesignerMainArea } from './designerMainArea/index';
import { FormDesignerToolbar } from './toolbar/formDesignerToolbar';
import { useMainStyles } from './styles/styles';
import classNames from 'classnames';

export const FormDesignerRenderer: FC = ({ }) => {
  const { styles } = useMainStyles();

  return (
    <div className={classNames("sha-page", styles.designerPage)}>
      <div className={styles.formDesigner}>
        <FormDesignerToolbar />
        <DesignerMainArea />
      </div>
    </div>
  );
};
