import React, { ReactElement } from 'react';
import { Select, Row } from 'antd';
import { ListEditor } from '@/components/listEditor';
import { CodeEditor } from '@/designer-components/codeEditor/codeEditor';
import { CodeEditorWithStandardConstants } from '../codeEditor/codeEditorWithConstants';
import { ILabelValueEditorProps, ILabelValueItem } from '@/components/labelValueEditor/labelValueEditor';
import { useStyles } from './styles';
import { ICodeEditorProps } from '../codeEditor/interfaces';
import { IObjectMetadata } from '@/interfaces';
import { InputComponent } from '.';
import { getWidth } from '../settingsInput/utils';
import { DefaultOptionType } from 'antd/lib/select';
import { isNullOrWhiteSpace } from '@/utils/nullables';

const stringToFriendlyMap = new Map<string, string>([['true', 'On'], ['false', 'Off'], ['editable', 'Editable'], ['readOnly', 'Read only'], ['inherited', 'Inherited']]);

export const convertValueToFriendlyString = (value: unknown): string => {
  if (typeof value === 'string') {
    return stringToFriendlyMap.get(value) ?? value;
  }

  return String(value);
};

export const getEditor = (
  availableConstantsExpression: string | undefined,
  codeEditorProps: ICodeEditorProps,
  constantsAccessor: IObjectMetadata | (() => Promise<IObjectMetadata>),
  resultTypeAccessor: IObjectMetadata | (() => Promise<IObjectMetadata>) | undefined,
): ReactElement => {
  return availableConstantsExpression?.trim()
    ? <CodeEditor {...codeEditorProps} availableConstants={constantsAccessor} resultType={resultTypeAccessor} />
    : <CodeEditorWithStandardConstants {...codeEditorProps} resultType={resultTypeAccessor} />;
};

const EMPTY_VALUE: ILabelValueItem[] = [];
const EMPTY_ON_CHANGE = (_: ILabelValueItem[]): void => {
  // noop
};

export const CustomLabelValueEditorInputs = (props: ILabelValueEditorProps): ReactElement => {
  const { styles } = useStyles();
  const { value = EMPTY_VALUE, onChange = EMPTY_ON_CHANGE, labelName, valueName, readOnly, labelTitle, valueTitle, colorName, iconName, colorTitle, iconTitle, dropdownOptions } = props;

  return (
    <ListEditor<ILabelValueItem>
      value={value}
      onChange={onChange}
      initNewItem={(_items) => {
        const newItem: ILabelValueItem = {};
        [labelName, valueName, colorName, iconName].forEach((name) => {
          if (!isNullOrWhiteSpace(name))
            newItem[name] = '';
        });
        return newItem;
      }}
      readOnly={readOnly}
    >
      {({ item, itemOnChange, readOnly }) => {
        const data = item as Record<string, string | null>;
        return (
          <div className={styles.rowInputs} style={{ gap: 8 }}>
            {labelName && (
              <InputComponent
                type="textField"
                placeholder={labelTitle}
                size="small"
                label=""
                id={labelName}
                propertyName={labelName}
                value={data[labelName] ?? ""}
                width={getWidth("textField", 100)}
                onChange={(value) => {
                  itemOnChange({ ...data, [labelName]: value } as ILabelValueItem, undefined);
                }}
              />
            )}
            {valueName && (
              <InputComponent
                type="textField"
                placeholder={valueTitle}
                size="small"
                label=""
                id={valueName}
                propertyName={valueName}
                value={data[valueName]}
                width={getWidth("textField", 100)}
                onChange={(value) => {
                  itemOnChange({ ...data, [valueName]: value } as ILabelValueItem, undefined);
                }}
              />
            )}
            <Row>
              {colorName && (
                <>
                  <InputComponent
                    type="colorPicker"
                    placeholder={colorTitle}
                    size="small"
                    label=""
                    id={colorName}
                    propertyName={colorName}
                    value={data[colorName]}
                    width={getWidth("colorPicker", 24)}
                    onChange={(value) => {
                      itemOnChange({ ...data, [colorName]: value } as ILabelValueItem, undefined);
                    }}
                  />
                  <Select
                    size="small"
                    variant="borderless"
                    showSearch
                    value={data[colorName] ?? null}
                    onChange={(value) => {
                      itemOnChange({ ...data, [colorName]: value } as ILabelValueItem, undefined);
                    }}
                    popupMatchSelectWidth={false}
                    style={{ width: 'max-content' }}
                    labelRender={() => {
                      return '';
                    }}
                    disabled={readOnly}
                    options={Array.isArray(dropdownOptions)
                      ? dropdownOptions.map<DefaultOptionType>((option) => ({ label: option.label, value: option.value }))
                      : []}
                  />
                </>
              )}
              {iconName && (
                <InputComponent
                  type="iconPicker"
                  placeholder={iconTitle}
                  readOnly={readOnly}
                  size="small"
                  label=""
                  id={iconName}
                  propertyName={iconName}
                  value={data[iconName]}
                  width={getWidth("iconPicker", 24)}
                  onChange={(value) => {
                    itemOnChange({ ...data, [iconName]: value } as ILabelValueItem, undefined);
                  }}
                />
              )}
            </Row>
          </div>
        );
      }}
    </ListEditor>
  );
};
