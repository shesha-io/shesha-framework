import React, { useEffect, useMemo } from 'react';
import { Button, ColorPicker, Row, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTheme } from '@/providers';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { getGradientColors } from '@/designer-components/_settings/utils';

type MultiColorInputProps = {
  /**
   * Colour stops in render order. Configurations saved before stops became an array hold a
   * record keyed by generated ids; those are normalised on read and rewritten as an array by
   * the first edit.
   */
  value: string[] | Record<string, string | undefined> | undefined;
  onChange: ((newColors: string[]) => void) | undefined;
  readOnly?: boolean | undefined;
  propertyName: string;
};

const MIN_STOPS = 2;

export const MultiColorInput = ({ value, onChange, readOnly }: MultiColorInputProps): ReactElement => {
  const { theme } = useTheme();

  const stops = useMemo(() => getGradientColors(value), [value]);
  const canRemoveColor = stops.length > MIN_STOPS;

  const setColorAt = (index: number, color: string): void => {
    onChange?.(stops.map((stop, i) => (i === index ? color : stop)));
  };

  const removeColorAt = (index: number): void => {
    onChange?.(stops.filter((_, i) => i !== index));
  };

  const primaryColor = typeof theme.application?.primaryColor === 'string'
    ? theme.application.primaryColor
    : '#1890ff';

  const isEmpty = stops.length === 0;
  useEffect(() => {
    if (isEmpty && readOnly !== true) onChange?.([primaryColor, '#fff']);
  }, [isEmpty, onChange, primaryColor, readOnly]);

  return (
    <>
      <Row style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
        {stops.map((color, index) => {
          return (
            <Tag
              key={index}
              style={{ backgroundColor: '#fff', padding: 0, margin: 0, display: 'flex', flexDirection: 'row' }}
              closable={canRemoveColor && readOnly !== true}
              onClose={() => removeColorAt(index)}
            >
              <ColorPicker
                value={color}
                onChange={(newColor) => setColorAt(index, newColor.toHexString())}
                disabled={readOnly ?? false}
                size="small"
              />
            </Tag>
          );
        })}
        <Button
          type="primary"
          ghost
          size="small"
          onClick={() => onChange?.([...stops, '#000000'])}
          disabled={readOnly ?? false}
          icon={<PlusOutlined />}
        >
        </Button>
      </Row>
    </>
  );
};
