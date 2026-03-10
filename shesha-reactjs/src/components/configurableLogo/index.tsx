import React, { FC } from 'react';
import { ConfigurableComponent } from '../appConfigurator/configurableComponent';
import CustomErrorBoundary from '@/components/customErrorBoundary';
import { getImgSrc } from './utils';
import { Button } from 'antd';
import { RebaseEditOutlined } from '@/icons/rebaseEditOutlined';

export interface IProps {
  imgSrc?: string;
}

export const ConfigurableLogo: FC<IProps> = ({ imgSrc }) => {
  return (
    <ConfigurableComponent>
      {(componentState, BlockOverlay) => (
        <CustomErrorBoundary>
          <div className={`logo ${componentState.wrapperClassName}`}>
            <BlockOverlay>
              <div className="sha-configurable-logo-button-wrapper">
                <Button title="Edit logo" shape="default" icon={<RebaseEditOutlined />} />
              </div>
            </BlockOverlay>
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
