import React, { FC } from 'react';
import loaderHelper, { SpinnerStyles } from './utils';
import { useStyles } from './styles/styles';

export interface IOverlayLoaderProps {
  loadingText?: string;
  color?: string;
  loading?: boolean;
  style?: SpinnerStyles;
}

export const OverlayLoader: FC<IOverlayLoaderProps> = ({
  color = 'black',
  style = 'PulseLoader',
  loading = false,
  loadingText = 'Loading...',
}) => {
  const Loader = loaderHelper(style);
  const { styles } = useStyles();

  if (!loading) {
    return null;
  }

  return (
    <div className={styles.overlayLoader}>
      <div className={styles.body}>
        <div className={styles.loadingContainer}>
          <Loader color={color} />
        </div>
        <p className={styles.text}>{loadingText}</p>
      </div>
    </div>
  );
};

export default OverlayLoader;
