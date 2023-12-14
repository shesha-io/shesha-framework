import React, { FC, useMemo, useState } from 'react';
import { Popover } from 'antd';
import { ColorResult, SketchPicker, SketchPickerProps } from 'react-color';
import './styles/styles.less';
import { useDeepCompareEffect } from 'react-use';
import classNames from 'classnames';

interface IColorPickerProps extends Omit<SketchPickerProps, 'color'> {
  title?: string;
  color?: ColorResult;
  readOnly?: boolean;
}

interface IColorPickerState {
  color?: ColorResult;
  visible?: boolean;
}

const ColorPicker: FC<IColorPickerProps> = ({ title, color, onChange, onChangeComplete, ...props }) => {
  const [state, setState] = useState<IColorPickerState>({ color, visible: false });

  useDeepCompareEffect(() => {
    setState(prev => ({ ...prev, color }));
  }, [color]);

  const handleVisibleChange = (visible: boolean) => {
    setState(prev => ({ ...prev, visible }));
  };

  const handleColorChange = (localColor: ColorResult, event: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, color: localColor }));

    if (onChange) {
      onChange(localColor, event);
    }
  };

  const handleChangeComplete = (localColor: ColorResult, event: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, color: localColor }));

    if (onChange) {
      onChange(localColor, event);
    }
  };

  const backgroundColor = useMemo(() => {
    return typeof state?.color === 'string' ? state?.color : state?.color?.hex;
  }, [state?.color]);

  if (props.readOnly)
    return <span className={classNames('color-picker-selector')} style={{ background: backgroundColor }} />;

  return (
    <Popover
      open={state?.visible}
      title={title || 'Pick color'}
      trigger="click"
      onOpenChange={handleVisibleChange}
      content={
        <SketchPicker
          onChange={handleColorChange}
          onChangeComplete={handleChangeComplete}
          {...props}
          color={state?.color?.hex}
        />
      }
    >
      <span className={classNames('color-picker-selector', 'editable')} style={{ background: backgroundColor }} />
    </Popover>
  );
};

export default ColorPicker;
