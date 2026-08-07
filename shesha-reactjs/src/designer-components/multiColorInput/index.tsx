import React, { useEffect, useMemo } from 'react';
import { Button, ColorPicker, Row, Tag } from 'antd';
import { nanoid } from '@/utils/uuid';
import { PlusOutlined } from '@ant-design/icons';
import { useTheme } from '@/providers';
import { ReactElement } from 'react-markdown/lib/react-markdown';

type MultiColorInputProps = {
  value: { [key: string]: string | undefined } | undefined;
  onChange: ((newColor: { [key: string]: string | undefined }) => void) | undefined;
  readOnly?: boolean | undefined;
  propertyName: string;
};

export const MultiColorInput = ({ value = {}, onChange, readOnly }: MultiColorInputProps): ReactElement => {
  const { theme } = useTheme();

  const stops = useMemo(
    () => Object.entries(value).filter((entry): entry is [string, string] => entry[1] !== undefined),
    [value],
  );
  const canRemoveColor = stops.length > 2;

  const setColor = (id: string, color: string | undefined): void => {
    onChange?.({ ...value, [id]: color });
  };

  const primaryColor = typeof theme.application?.primaryColor === 'string'
    ? theme.application.primaryColor
    : '#1890ff';

  const isEmpty = stops.length === 0;
  useEffect(() => {
    if (isEmpty && readOnly !== true) onChange?.({ 1: primaryColor, 2: '#fff' });
  }, [isEmpty, onChange, primaryColor, readOnly]);

  return (
    <>
      <Row style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
        {stops.map(([id, color]) => {
          return (
            <Tag
              key={id}
              style={{ backgroundColor: '#fff', padding: 0, margin: 0, display: 'flex', flexDirection: 'row' }}
              closable={canRemoveColor}
              onClose={() => setColor(id, undefined)}
            >
              <ColorPicker
                value={color}
                onChange={(newColor) => setColor(id, newColor.toHexString())}
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
          onClick={() => setColor(nanoid(), '#000000')}
          disabled={readOnly ?? false}
          icon={<PlusOutlined />}
        >
        </Button>
      </Row>
    </>
  );
};
