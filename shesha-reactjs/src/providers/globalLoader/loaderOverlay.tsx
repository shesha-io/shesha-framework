import React, { FC, useState } from 'react';
import { Spin } from 'antd';
import { useStyles } from './styles';

export interface LoaderOverlayProps {
  message: string;
  isBlocking?: boolean;
}

export const LoaderOverlay: FC<LoaderOverlayProps> = ({ message, isBlocking = false }) => {
  const { styles } = useStyles();
  const [useSpinFallback, setUseSpinFallback] = useState(false);

  const handleImageError = (): void => {
    setUseSpinFallback(true);
  };

  return (
    <div
      className={isBlocking ? styles.globalLoaderOverlayBlocking : styles.globalLoaderOverlay}
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
