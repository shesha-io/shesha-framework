import React, { FC } from 'react';
import { ConfigurableComponent } from '../appConfigurator/configurableComponent';
import CustomErrorBoundary from '@/components/customErrorBoundary';
import { getImgSrc } from './utils';

interface IProps {
  imgSrc?: string;
}

export const ConfigurableLogo: FC<IProps> = ({ imgSrc }) => {
  return (
    <ConfigurableComponent>
      {(componentState, BlockOverlay) => (
        <CustomErrorBoundary>
          <div className={`logo ${componentState.wrapperClassName}`}>
            <BlockOverlay />
            <a href="/">
              <img src={getImgSrc(imgSrc)} />
            </a>
          </div>
        </CustomErrorBoundary>
      )}
    </ConfigurableComponent>
  );
};

export default ConfigurableLogo;
