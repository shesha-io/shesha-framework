import React, { FC } from 'react';

import SettingsMenu from './settingsMenu';
import { SettingsEditorProvider } from './provider';
import SettingEditor from './settingEditor';
import SettingsEditorToolbar from './toolbar';
import { useStyles } from './styles/styles';
import { SizableColumns } from '../sizableColumns';
import classNames from 'classnames';
import AppSelector from './appSelector';

export const SettingsEditor: FC = () => {
  const { styles } = useStyles();
  return (
    <SettingsEditorProvider>
      <div className={styles.shaSettingsEditor}>
        <AppSelector />
        <SizableColumns
          sizes={[25, 75]}
          minSize={150}
          expandToMin={false}
          gutterSize={8}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
          className={classNames(styles.container)}
        >
          <div className={styles.mainArea}>
            <SettingsMenu />
          </div>
          <div className={styles.propsPanel}>
            <SettingsEditorToolbar />
            <SettingEditor />
          </div>
        </SizableColumns>
      </div>
    </SettingsEditorProvider>
  );
};

export default SettingsEditor;
