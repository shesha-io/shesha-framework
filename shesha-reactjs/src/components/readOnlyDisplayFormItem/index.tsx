import { ValueRenderer } from '@/components/valueRenderer/index';
import React, { FC, useMemo } from 'react';
import { getMoment } from '@/utils/date';
import { ISelectOption } from '@/components/autocomplete';
import QuickView, { GenericQuickView } from '@/components/quickView';
import { IReadOnlyDisplayFormItemProps } from './models';
import { useStyles } from './styles/styles';
import ReflistTag from '../refListDropDown/reflistTag';
import InputField from './inputField';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { getClassNameOrUndefined, getIdOrUndefined } from '@/utils/entity';
import { getFirstNonEmptyStringPropertyOrUndefined } from '@/utils/object';
import { findMap, isNonEmptyArray } from '@/utils/array';

export const ReadOnlyDisplayFormItem: FC<IReadOnlyDisplayFormItemProps> = <TValue = unknown>(props: IReadOnlyDisplayFormItemProps<TValue>) => {
  const {
    value,
    type = 'string',
    dateFormat = 'DD-MM-YYYY',
    timeFormat = 'hh:mm',
    dropdownDisplayMode = 'raw',
    render,
    quickviewEnabled,
    quickviewFormPath,
    quickviewDisplayPropertyName = "",
    quickviewGetEntityUrl,
    quickviewWidth,
    style,
    tagStyle,
    showIcon,
    solidColor,
    showItemName,
    styleValue,
    enableFullStyle,
  } = props;

  // ToDo: remove `textAlign` after migrate all components to the new styles
  const { styles } = useStyles({ styleValue, enableFullStyle, textAlign: styleValue?.font?.align || style?.textAlign || 'left' });

  const renderValue = useMemo(() => {
    if (isDefined(render)) {
      return typeof render === 'function' ? render() : render;
    }

    if (!isDefined(value) || (typeof (value) === "string" && isNullOrWhiteSpace(value)))
      return '';

    switch (type) {
      case 'dropdown':
        if (!Array.isArray(value)) {
          const innerData = typeof value === 'object' && "data" in value && typeof (value.data) === 'object' && isDefined(value.data)
            ? value.data
            : undefined;

          const entityId = typeof value === 'object'
            ? getIdOrUndefined(value) ?? getIdOrUndefined(innerData)
            : typeof (value) === "string"
              ? value
              : undefined;
          const className = getClassNameOrUndefined(value) ?? getClassNameOrUndefined(innerData);
          const displayName = findMap([value, innerData], (p) => typeof (p) === "object"
            ? getFirstNonEmptyStringPropertyOrUndefined(value, ["label", "_displayName"])
            : undefined,
          );

          if (Boolean(quickviewEnabled) && isDefined(quickviewFormPath)) {
            return isNotNullOrWhiteSpace(quickviewGetEntityUrl)
              ? (
                <QuickView
                  entityId={entityId}
                  formIdentifier={quickviewFormPath}
                  getEntityUrl={quickviewGetEntityUrl}
                  displayProperty={quickviewDisplayPropertyName}
                  width={quickviewWidth}
                />
              )
              : (
                <GenericQuickView
                  entityId={entityId}
                  entityType={className}
                  formIdentifier={quickviewFormPath}
                  displayName={displayName}
                  displayProperty={quickviewDisplayPropertyName}
                  width={quickviewWidth}
                />
              );
          } else {
            if (dropdownDisplayMode === 'tags') {
              const rawValue = typeof (value) === "string" || typeof (value) === "number" ? value : undefined;
              const objValue = typeof (value) === "object" ? value as unknown as ISelectOption : undefined;
              return (
                <ReflistTag
                  value={rawValue}
                  color={objValue?.color}
                  icon={objValue?.icon}
                  showIcon={showIcon}
                  tagStyle={tagStyle}
                  description={objValue?.description}
                  solidColor={solidColor}
                  showItemName={showItemName}
                  label={displayName}
                />
              );
            } else
              return <InputField className={styles.inputField} style={style} value={displayName ?? (typeof value === 'object' ? null : value as string)} />;
          }
        }
        return null;

      case 'dropdownMultiple': {
        const typedValue = Array.isArray(value) && (!isNonEmptyArray(value) || typeof (value[0]) === "object")
          ? (value as ISelectOption[]).filter(isDefined)
          : undefined;
        if (typedValue) {
          const values = typedValue.map(({ label }) => label);

          return dropdownDisplayMode === 'raw'
            ? <InputField className={styles.inputField} style={style} value={values.join(', ')} />
            : (
              <div
                className={styles.wrapper}
                data-tag-wrapper="true"
                style={{
                  ...style,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  boxSizing: 'border-box',
                }}
              >
                {typedValue.map(({ label, color, icon, value, description }) => {
                  return (
                    <ReflistTag
                      key={value}
                      value={value ?? undefined}
                      color={color}
                      icon={icon}
                      description={description}
                      showIcon={showIcon}
                      tagStyle={tagStyle}
                      solidColor={solidColor}
                      showItemName={showItemName}
                      label={label}
                    />
                  );
                })}
              </div>
            );
        }

        throw new Error(
          `Invalid data type passed. Expected IGuidNullableEntityReferenceDto[] but found ${typeof value}`,
        );
      }
      case 'time': {
        return <InputField className={styles.inputField} style={style} value={<ValueRenderer value={value} meta={{ path: '', dataType: 'time', dataFormat: timeFormat, isVisible: true }} />} />;
      }
      case 'datetime': {
        return <InputField className={styles.inputField} style={style} value={getMoment(value, dateFormat)?.format(dateFormat) ?? ''} />;
      }
      case 'textArea': {
        return <div style={{ ...style, whiteSpace: 'pre-wrap', lineHeight: '1.2' }}>{String(value)}</div>;
      }

      default: {
        return <InputField className={styles.inputField} style={style} value={Boolean(value) && typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)} />;
      }
    }
  }, [value,
    type,
    dateFormat,
    timeFormat,
    dropdownDisplayMode,
    render,
    quickviewEnabled,
    quickviewFormPath,
    quickviewDisplayPropertyName,
    quickviewGetEntityUrl,
    quickviewWidth,
    showIcon,
    showItemName,
    solidColor,
    tagStyle,
    style,
    styles.wrapper,
    styles.inputField,
  ]);

  // Only apply layout-related styles to outer container, not appearance styles
  // Appearance styles (border, background, etc.) are applied by InputField to avoid double borders
  const containerStyle: React.CSSProperties = {
    width: style?.width,
    minWidth: style?.minWidth,
    maxWidth: style?.maxWidth,
  };

  return (
    <span className={styles.readOnlyDisplayFormItem} style={containerStyle}>
      {renderValue}
    </span>
  );
};

export default ReadOnlyDisplayFormItem;
