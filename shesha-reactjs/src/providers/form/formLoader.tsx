import React, { FC, useState } from 'react';
import { Spin } from 'antd';
import { createStyles } from '@/styles';

export interface FormLoaderProps {
  message: string;
}

const useStyles = createStyles(({ css, cx }) => {
  const contentContainer = "content-container";
  const loaderImage = "loader-image";
  const loaderMessage = "loader-message";

  // Form loader always blocks - overlay covering the entire form container
  const formLoaderOverlay = cx("form-loader-overlay", css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    pointer-events: auto;
    cursor: not-allowed;
    border-radius: inherit; /* Inherit border radius from form container */

    * {
      pointer-events: none;
    }

    .${contentContainer} {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .${loaderImage} {
      margin-bottom: 12px;
    }

    .${loaderMessage} {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.85);
    }
  `);

  return {
    formLoaderOverlay,
    contentContainer,
    loaderImage,
    loaderMessage,
  };
});

export const FormLoader: FC<FormLoaderProps> = ({ message }) => {
  const { styles } = useStyles();
  const [useSpinFallback, setUseSpinFallback] = useState(false);

  const handleImageError = (): void => {
    setUseSpinFallback(true);
  };

  return (
    <div
      className={styles.formLoaderOverlay}
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
