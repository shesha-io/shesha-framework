import React, { FC } from 'react';
import loaderHelper, { SpinnerStyles } from './utils';

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

  if (!loading) {
    return null;
  }

  return (
    <div className="overlay-loader">
      <div className="body">
        <div className="loading-container">
          <Loader color={color} />
        </div>
        <p className="text">{loadingText}</p>
      </div>
    </div>
  );
};

export default OverlayLoader;
