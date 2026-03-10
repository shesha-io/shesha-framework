import React, { FC } from 'react';
import classNames from 'classnames';
import { ConfigurableForm } from '@/components';
import { useStyles } from './styles/styles';
import { ACTIVE_HEADER } from './constant';
import { FormFullName } from '@/providers';

interface ILayoutHeaderProps {
  collapsed?: boolean;
  headerFormId?: FormFullName;
}

const LayoutHeader: FC<ILayoutHeaderProps> = ({ collapsed, headerFormId }) => {
  const { styles } = useStyles();

  const localHeaderFormId = headerFormId ?? ACTIVE_HEADER;
  return (
    <div className={classNames(styles.layoutHeader, { collapsed })}>
      <div className={styles.headerWrapper}>
        <ConfigurableForm
          mode="readonly"
          formId={localHeaderFormId}
          showFormInfoOverlay={false}
          showDataLoadingIndicator={false}
          showMarkupLoadingIndicator={false}
        />
      </div>
    </div>
  );
};

export default LayoutHeader;
