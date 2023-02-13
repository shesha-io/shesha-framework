import { BaseWidget, BasicConfig, SelectFieldSettings } from 'react-awesome-query-builder';
import React from 'react';
import { Input, Row, Col } from 'antd';

export type DateTimeDynamicWidgetType = BaseWidget & SelectFieldSettings;

/**
 * A widget for rendering date and time components in dynamic modes on a query builder
 * This component will allow you to pass date to be filtered as string, allowing to be an expression, such as {{startDate}}
 * This is especially useful for tables that you want to be filtered dynamically as the date, time or date-time form component's values change
 */
const DateTimeDynamicWidget: DateTimeDynamicWidgetType = {
  ...BasicConfig.widgets.text,
  jsType: 'string',
  type: 'dateTimeDynamic',
  factory: props => {
    const {
      config,
      value,
      setValue,
      isSpecialRange,
      valuePlaceholder,
      placeholders,
      readonly,
      maxLength,
    } = props as any;

    const { renderSize } = config.settings;

    let startVal = '';
    let endVal = '';

    if (Array.isArray(value)) {
      startVal = value[0];

      if (value?.length === 2) {
        endVal = value[1];
      }
    }

    const onChange = (v: string | string[]) => {
      setValue(v);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value);

    const handleStartValue = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange([event?.target?.value, endVal]);
    };

    const handleEndValue = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange([startVal, event?.target?.value]);
    };

    if (isSpecialRange) {
      let placeholderStart = '';
      let placeholderEnd = '';

      if (Array.isArray(placeholders) && placeholders?.length === 2) {
        placeholderStart = placeholders[0];
        placeholderEnd = placeholders[1];
      }
      return (
        <Input.Group size={renderSize}>
          <Row gutter={8}>
            <Col span={11}>
              <Input
                type={'text'}
                value={startVal}
                onChange={handleStartValue}
                size={renderSize}
                placeholder={placeholderStart}
                maxLength={maxLength}
                key="widget-text"
              />
            </Col>

            <Col>
              <span>and</span>
            </Col>

            <Col span={11}>
              <Input
                type={'text'}
                value={endVal}
                onChange={handleEndValue}
                size={renderSize}
                placeholder={placeholderEnd}
                disabled={readonly}
                maxLength={maxLength}
                key="widget-text"
              />
            </Col>
          </Row>
        </Input.Group>
      );
    }

    return (
      <Input
        onChange={handleChange}
        value={typeof value === 'string' ? value : null}
        size={renderSize}
        placeholder={valuePlaceholder}
        disabled={readonly}
        maxLength={maxLength}
        key="widget-text"
      />
    );
  },
};

export default DateTimeDynamicWidget;
