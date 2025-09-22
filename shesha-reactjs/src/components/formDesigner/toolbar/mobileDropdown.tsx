import React, { FC } from 'react';
import { Tooltip } from 'antd';
import { useCanvas } from '@/providers';
import CustomDropdown from '@/designer-components/_settings/utils/CustomDropdown';
import { screenSizeOptions } from '../utils/svgConstants';

export interface IPreviewButtonProps { }

export const DeviceOptions: FC<IPreviewButtonProps> = ({ }) => {
  const { setCanvasWidth, designerWidth } = useCanvas();


  return (
    <CustomDropdown
      placeholder="Select a device"
      optionFilterProp="label"
      defaultValue={'1024px'}
      style={{ width: '120px' }}
      size='small'
      customTooltip='Add a custom screen size e.g "1440px".'
      popupMatchSelectWidth={false}
      onChange={(val) => {
        const value = parseInt(val, 10);
        setCanvasWidth(value, value > 850 ? 'desktop' : value > 430 ? 'tablet' : 'mobile');
      }}
      value={typeof designerWidth === 'number' ? `${designerWidth}px` : designerWidth}
      labelRender={({ label, value }) => {
        const option = screenSizeOptions.find(opt => opt.value === value);
        const Icon = option?.icon;
        return (
          <Tooltip title={value}>
            {Icon ? <Icon /> : null} {label ?? value}
          </Tooltip>
        );
      }
      }
      options={screenSizeOptions}
    />
  );
};
