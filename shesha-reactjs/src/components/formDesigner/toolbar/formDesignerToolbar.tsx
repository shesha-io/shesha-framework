import React, { FC } from 'react';
import { SaveMenu } from './saveMenu';
import { useFormDesignerStateSelector } from '@/providers/formDesigner';
import { useSheshaApplication } from '@/providers';
import { DebugButton } from './debugButton';
import { UndoRedoButtons } from './undoRedoButtons';
import { PreviewButton } from './previewButton';
import { FormSettingsButton } from './formSettingsButton';
import { useStyles } from '../styles/styles';
import { CanvasConfig } from './canvasConfig';
import { CustomActions } from './customActions';

export const FormDesignerToolbar: FC = () => {
  const readOnly = useFormDesignerStateSelector((x) => x.readOnly);
  const formSettings = useFormDesignerStateSelector((x) => x.formSettings);
  const { styles } = useStyles();

  const { anyOfPermissionsGranted } = useSheshaApplication();

  const isGranted = formSettings?.access !== 4 || anyOfPermissionsGranted(formSettings?.permissions || []);

  return (
    <div className={styles.shaDesignerToolbar}>
      {isGranted && (
        <>
          <div className={styles.shaDesignerToolbarLeft}>
            {!readOnly && (
              <SaveMenu />
            )}
          </div>
          <div className={styles.shaDesignerToolbarCenter}>
            <CanvasConfig />
          </div>
          <div className={styles.shaDesignerToolbarRight}>
            <FormSettingsButton />
            <PreviewButton />
            <DebugButton />

            {!readOnly && (<UndoRedoButtons />)}
            <CustomActions />
          </div>
        </>
      )}
    </div>
  );
};
