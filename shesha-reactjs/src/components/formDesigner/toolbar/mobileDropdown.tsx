import { FC } from 'react';
import { Tooltip } from 'antd';
import { useCanvas } from '@/providers';
import CustomDropdown from '@/designer-components/_settings/utils/CustomDropdown';
import { CANVAS_PRESET_SENTINEL, getDeviceTypeByWidth, screenSizeOptions } from '@/providers/canvas/utils';

export const DeviceOptions: FC = () => {
  const { setCanvasWidth, setCanvasAutoWidth, designerWidth, autoWidth } = useCanvas();

  // In "Canvas" mode the stored width is whatever was last measured, so show the sentinel rather
  // than that number - otherwise the dropdown reads as a device preset that happens to match.
  const displayValue = autoWidth ? CANVAS_PRESET_SENTINEL : designerWidth;

  return (
    <CustomDropdown
      placeholder="Select a device"
      optionFilterProp="label"
      style={{ width: '120px' }}
      size="small"
      customTooltip='Add a custom screen size e.g "1024px".'
      popupMatchSelectWidth={false}
      onChange={(val) => {
        // The responsive "Canvas" option fills the available space; the actual width is measured
        // by the designer canvas itself (see SidebarContainer).
        if (val === CANVAS_PRESET_SENTINEL || val.includes('%')) {
          setCanvasAutoWidth(true);
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
