import React, { FC } from 'react';
import { ConfigurableComponent } from '../appConfigurator/configurableComponent';
import CustomErrorBoundary from '../customErrorBoundary';

export const ConfigurableLogo: FC = () => {
  return (
    <ConfigurableComponent>
      {(componentState, BlockOverlay) => (
        <CustomErrorBoundary>
          <div className={`logo ${componentState.wrapperClassName}`}>
            <BlockOverlay />
            <a href="/">
              <img src="/images/app-logo.png" />
            </a>
          </div>
        </CustomErrorBoundary>
      )}
    </ConfigurableComponent>
  );
};

export default ConfigurableLogo;
