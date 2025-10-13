import { useActiveDoc } from '@/configuration-studio/cs/hooks';
import { useStyles } from '@/configuration-studio/styles';
import { BranchesOutlined, CodeOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React, { FC } from 'react';

export const QuickInfoIcons: FC = () => {
  const { styles, theme } = useStyles();

  const activeDoc = useActiveDoc();

  return (
    <div className={styles.csQuickInfoIcons}>
      {activeDoc && (
        <>
          {activeDoc.flags.isExposed && <Tooltip title="Configuration originally defined in a base module which has been exposed"><BranchesOutlined /></Tooltip>}
          {activeDoc.flags.isCodeBased && <Tooltip title="Configuration is code based or has a corresponding code based portion"><CodeOutlined /></Tooltip>}
          {activeDoc.flags.isCodegenPending && <Tooltip title="Corresponding code based configuration has not been updated"><ExclamationCircleOutlined style={{ color: theme.colorError }} /></Tooltip>}
          {activeDoc.flags.isUpdated && <Tooltip title="Current version has manual changes (i.e. is not a version that was imported via package)"><EditOutlined /></Tooltip>}
        </>
      )}
    </div>
  );
};
