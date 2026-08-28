import { FC } from 'react';
import { App, Tooltip } from 'antd';
import { useCanvas } from '@/providers';
import CustomDropdown from '@/designer-components/_settings/utils/CustomDropdown';
import { CANVAS_PRESET_SENTINEL, getDeviceTypeByWidth, MAX_CANVAS_WIDTH_PERCENT, parseCanvasWidthPercent, screenSizeOptions } from '@/providers/canvas/utils';
import { isDefined } from '@/utils/nullables';

export const DeviceOptions: FC = () => {
  const { message } = App.useApp();
  const { setCanvasWidth, setCanvasAutoWidth, setCanvasWidthPercent, designerWidth, autoWidth, widthPercent } = useCanvas();

  // In "Canvas" mode the stored width is whatever was last measured, so show the sentinel rather
  // than that number - otherwise the dropdown reads as a device preset that happens to match. A
  // percentage below the maximum is shown as itself, so the canvas size on screen is accounted for.
  const displayValue = !autoWidth
    ? designerWidth
    : widthPercent < MAX_CANVAS_WIDTH_PERCENT
      ? `${widthPercent}%`
      : CANVAS_PRESET_SENTINEL;

  return (
    <CustomDropdown
      placeholder="Select a device"
      optionFilterProp="label"
      style={{ width: '120px' }}
      size="small"
      customTooltip={`Add a custom screen size e.g "1024px". A percentage sizes the canvas to that share of the available space; ${MAX_CANVAS_WIDTH_PERCENT}% is the maximum, so anything larger is applied as ${MAX_CANVAS_WIDTH_PERCENT}%.`}
      popupMatchSelectWidth={false}
      onChange={(val) => {
        // The responsive "Canvas" option fills the available space.
        if (val === CANVAS_PRESET_SENTINEL) {
          setCanvasAutoWidth(true);
          return;
        }

        // A percentage takes that share of the available space. Above the maximum there is nothing
        // left to expand into, so the value is overridden - and the user is told, rather than being
        // left to wonder why the canvas did not grow to what they typed.
        const parsed = parseCanvasWidthPercent(val);
        if (isDefined(parsed)) {
          if (parsed.wasClamped)
            message.warning(`${val.trim()} is wider than the available space. Applied ${parsed.percent}% instead, which is the maximum.`);

          setCanvasWidthPercent(parsed.percent);
          return;
        }

        const value = parseInt(val, 10);
        // Ignore custom entries that are not a usable width ("abc" would pin the canvas to "NaNpx")
        if (!Number.isFinite(value) || value <= 0) return;
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
