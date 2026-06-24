import React, { FC } from 'react';
import { Tooltip } from 'antd';
import { useCanvas } from '@/providers';
import CustomDropdown from '@/designer-components/_settings/utils/CustomDropdown';
import { CANVAS_PRESET_SENTINEL, defaultDesignerWidth, getDeviceTypeByWidth, screenSizeOptions } from '@/providers/canvas/utils';

export const DeviceOptions: FC = () => {
  const { setCanvasWidth, designerWidth } = useCanvas();

  // When the actual width matches the screen's available width, show the Canvas sentinel so it displays as "Canvas" in the dropdown
  const displayValue = designerWidth === defaultDesignerWidth ? CANVAS_PRESET_SENTINEL : designerWidth;

  return (
    <CustomDropdown
      placeholder="Select a device"
      optionFilterProp="label"
      style={{ width: '120px' }}
      size="small"
      customTooltip='Add a custom screen size e.g "1024px".'
      popupMatchSelectWidth={false}
      onChange={(val) => {
        // The responsive "Canvas" option fills the available space; treat it as desktop.
        if (val === CANVAS_PRESET_SENTINEL || val.includes('%')) {
          setCanvasWidth(defaultDesignerWidth, 'desktop');
          return;
        }
        const value = parseInt(val, 10);
        setCanvasWidth(value, getDeviceTypeByWidth(value));
      }}
      value={displayValue}
      labelRender={({ label, value }) => {
        const option = screenSizeOptions.find((opt) => opt.value === value);
        const Icon = option?.icon;
        return (
          <Tooltip title={value}>
            {Icon ? <Icon /> : null} {label ?? value}
          </Tooltip>
        );
      }}
      options={screenSizeOptions.map((opt) => ({ ...opt, title: opt.value }))}
    />
  );
};
