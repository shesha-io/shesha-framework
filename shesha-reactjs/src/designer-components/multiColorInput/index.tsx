import React, { useEffect, useRef } from 'react';
import { Button, Row, Tag } from 'antd';
import { nanoid } from '@/utils/uuid';
import { PlusOutlined } from '@ant-design/icons';
import { useTheme } from '@/providers';
import { SettingInput } from '../settingsInput/settingsInput';
import { ColorPicker } from '@/components/colorPicker';
import { gradientDirectionOptions } from '../_settings/utils/background/utils';
import { ReactElement } from 'react-markdown/lib/react-markdown';

type MultiColorInputProps = {
  value: { [key: string]: string | undefined } | undefined;
  onChange: ((newColor: { [key: string]: string | undefined }) => void) | undefined;
  readOnly?: boolean | undefined;
  propertyName: string;
};

export const MultiColorInput = ({ value, onChange, readOnly, propertyName }: MultiColorInputProps): ReactElement => {
  const { theme } = useTheme();
  const directionInputId = React.useMemo(() => nanoid(), []);

  const colors = value ?? {};

  const stops = Object.entries(colors).filter(([, color]) => color !== undefined);
  const isEmpty = stops.length === 0;
  const primaryColor = typeof theme.application?.primaryColor === 'string' ? theme.application.primaryColor : undefined;

  const hasSeeded = useRef(false);
  useEffect(() => {
    if (hasSeeded.current || !isEmpty || readOnly === true) return;
    hasSeeded.current = true;
    // Both stops need a concrete colour: an undefined one would seed a gradient with a missing swatch.
    onChange?.({ 1: primaryColor ?? '#1890ff', 2: '#fff' });
  }, [isEmpty, onChange, readOnly, primaryColor]);

  return (
    <>
      <Row style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        {stops.map(([id, color]) => {
          return (
            <Tag
              key={id}
              style={{ backgroundColor: '#fff', padding: 0, margin: 0, display: 'flex', flexDirection: 'row' }}
              closable={id !== '1' && id !== '2'}
              onClose={() => onChange?.({ ...colors, [id]: undefined })}
            >
              {/* Deliberately NOT a form-bound SettingInput. Each swatch used to bind its own path
                  (`...gradient.colors.1`), which meant editing one stop while the gradient was still
                  inherited wrote only that leaf — the siblings were never real form values, so the
                  whole set collapsed to the single edited colour. Writing through the picker's own
                  onChange sends the complete set, so the first edit overrides inheritance with every
                  stop intact. It also keeps the gradient a single input for inheritance purposes. */}
              <ColorPicker
                value={color}
                onChange={(newColor) => onChange?.({ ...colors, [id]: typeof newColor === 'string' ? newColor : '' })}
                readOnly={readOnly ?? false}
                size="small"
                allowClear
              />
            </Tag>
          );
        })}
        <Button
          type="primary"
          ghost
          size="small"
          onClick={() => onChange?.({ ...colors, [nanoid()]: '#000000' })}
          disabled={readOnly ?? false}
          icon={<PlusOutlined />}
          style={{ margin: '5px 0px' }}
        >
        </Button>
      </Row>
      <SettingInput
        id={directionInputId}
        propertyName={propertyName.replace('gradient.colors', 'gradient.direction')}
        label="Direction"
        hideLabel={true}
        width="120px"
        type="dropdown"
        dropdownOptions={gradientDirectionOptions}
      />
    </>
  );
};

