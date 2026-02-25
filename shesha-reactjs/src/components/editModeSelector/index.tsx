import { EditMode } from '@/interfaces';
import { Radio } from 'antd';
import React, { CSSProperties, FC, useMemo } from 'react';
import Icon from '../icon/Icon';
import { SettingOutlined } from '@ant-design/icons';

export interface IReadOnlyModeSelectorProps {
  value?: EditMode;
  defaultValue?: EditMode;
  readOnly?: boolean;
  onChange?: (value: EditMode) => void;
  size?: 'small' | 'middle' | 'large';
  className?: string;
}

const notRecommendedColor = '#F0F0F0';

const EditModeSelector: FC<IReadOnlyModeSelectorProps> = ({ value, defaultValue, readOnly, onChange, size, className }) => {
  const val: EditMode = value === false
    ? 'readOnly'
    : !value || value === true
      ? 'inherited'
      : value;

  const hints: { e: string; r: string; i: string; d: string } = useMemo(() => {
    switch (defaultValue) {
      case 'editable':
        return { e: 'Editable (Default for Metadata)', r: 'Read only (Not recommended for Metadata)', i: 'Inherited (Not recommended for Metadata)', d: 'Default Editable' };
      case 'readOnly':
        return { e: 'Editable (Not recommended for Metadata)', r: 'Read only (Default for Metadata)', i: 'Inherited (Not recommended for Metadata)', d: 'Default Read only' };
      case 'inherited':
        return { e: 'Editable (Not recommended for Metadata)', r: 'Read only (Not recommended for Metadata)', i: 'Inherited (Default for Metadata)', d: 'Default Inherited' };
      default:
        return { e: 'Editable', r: 'Read only', i: 'Inherited', d: 'Default Inherited' };
    }
  }, [defaultValue]);

  const styles: { e?: CSSProperties; r?: CSSProperties; i?: CSSProperties } = useMemo(() => {
    if (!defaultValue) return { e: undefined, r: undefined, i: undefined };
    const e = defaultValue === 'editable' || value === 'editable' || value === true ? undefined : { backgroundColor: notRecommendedColor };
    const r = defaultValue === 'readOnly' || value === 'readOnly' || value === false ? undefined : { backgroundColor: notRecommendedColor };
    const i = defaultValue === 'inherited' || value === 'inherited' ? undefined : { backgroundColor: notRecommendedColor };
    return { e, r, i };
  }, [defaultValue, value]);

  return (
    <Radio.Group buttonStyle="solid" value={val} onChange={(e) => onChange(e.target.value)} size={size} disabled={readOnly} className={className}>
      <Radio.Button key="editable" value="editable" style={styles.e}><Icon icon="editIcon" hint={hints.e} /></Radio.Button>
      <Radio.Button key="readOnly" value="readOnly" style={styles.r}><Icon icon="readonlyIcon" hint={hints.r} /></Radio.Button>
      <Radio.Button key="inherited" value="inherited" style={styles.i}><Icon icon="inheritIcon" hint={hints.i} /></Radio.Button>
      <Radio.Button key="default" value="default"><Icon icon={<SettingOutlined />} hint={hints.d} /></Radio.Button>
    </Radio.Group>
  );
};

export default EditModeSelector;
