import React, { FC, useState } from 'react';
import { Spin } from 'antd';
import { useStyles } from './styles';
import { LoaderMode } from './index';

export interface LoaderOverlayProps {
  message: string;
  mode?: LoaderMode;
}

export const LoaderOverlay: FC<LoaderOverlayProps> = ({ message, mode = 'non-blocking' }) => {
  const { styles } = useStyles();
  const [useSpinFallback, setUseSpinFallback] = useState(false);

  const handleImageError = () => {
    setUseSpinFallback(true);
  };

  return (
    <div
      className={mode === 'blocking' ? styles.globalLoaderOverlayBlocking : styles.globalLoaderOverlay}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
    >
      <div className={styles.contentContainer}>
        {!useSpinFallback ? (
          <img
            src="/images/SheshaLoadingAnimation.gif"
            alt="Loading..."
            className={styles.loaderImage}
            onError={handleImageError}
          />
        ) : (
          <Spin size="large" className={styles.loaderImage} />
        )}
        <div className={styles.loaderMessage} aria-hidden="true">
          {message}
        </div>
      </div>
    </div>
  );
};
