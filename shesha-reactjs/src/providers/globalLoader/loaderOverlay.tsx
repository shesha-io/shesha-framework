import React, { FC } from 'react';
import { useStyles } from './styles';

export interface LoaderOverlayProps {
  message: string;
}

export const LoaderOverlay: FC<LoaderOverlayProps> = ({ message }) => {
  const { styles } = useStyles();

  return (
    <div className={styles.globalLoaderOverlay}>
      <div className={styles.contentContainer}>
        <img
          src="/images/SheshaLoadingAnimation.gif"
          alt="Loading..."
          className={styles.loaderImage}
        />
        <div className={styles.loaderMessage}>
          {message}
        </div>
      </div>
    </div>
  );
};
