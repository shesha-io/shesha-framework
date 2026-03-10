import React, { ReactElement } from 'react';
import { Select, Row } from 'antd';
import { CodeEditor, ListEditor } from '@/components';
import { CodeEditorWithStandardConstants } from '../codeEditor/codeEditorWithConstants';
import { ILabelValueEditorProps, ILabelValueItem } from '@/components/labelValueEditor/labelValueEditor';
import { useStyles } from './styles';
import { ICodeEditorProps } from '../codeEditor/interfaces';
import { IObjectMetadata } from '@/interfaces';
import { InputComponent } from '.';
import { getWidth } from '../settingsInput/utils';
export const getEditor = (
  availableConstantsExpression: string,
  codeEditorProps: ICodeEditorProps,
  constantsAccessor: IObjectMetadata | (() => Promise<IObjectMetadata>),
  resultTypeAccessor: IObjectMetadata | (() => Promise<IObjectMetadata>) | undefined,
): ReactElement => {
  return availableConstantsExpression?.trim()
    ? <CodeEditor {...codeEditorProps} availableConstants={constantsAccessor} resultType={resultTypeAccessor} />
    : <CodeEditorWithStandardConstants {...codeEditorProps} resultType={resultTypeAccessor} />;
};

export const CustomLabelValueEditorInputs = (props: ILabelValueEditorProps): ReactElement => {
  const { styles } = useStyles();
  const { value, onChange, labelName, valueName, readOnly, labelTitle, valueTitle, colorName, iconName, colorTitle, iconTitle, dropdownOptions } = props;

  return (
    <ListEditor<ILabelValueItem>
      value={value}
      onChange={onChange}
      initNewItem={(_items) => ({
        [labelName]: '',
        [valueName]: '',
        [colorName]: '',
        [iconName]: '',
      })}
      readOnly={readOnly}
    >
      {({ item, itemOnChange, readOnly }) => (
        <div className={styles.rowInputs} style={{ gap: 8 }}>
          <InputComponent
            type="textField"
            placeholder={labelTitle}
            size="small"
            label=""
            id={labelName}
            propertyName={labelName}
            value={item[labelName]}
            width={getWidth("textField", 100)}
            onChange={(value) => {
              itemOnChange({ ...item, [labelName]: value }, undefined);
            }}
          />
          <InputComponent
            type="textField"
            placeholder={valueTitle}
            size="small"
            label=""
            id={valueName}
            propertyName={valueName}
            value={item[valueName]}
            width={getWidth("textField", 100)}
            onChange={(value) => {
              itemOnChange({ ...item, [valueName]: value }, undefined);
            }}
          />
          <Row>
            <InputComponent
              type="colorPicker"
              placeholder={colorTitle}
              size="small"
              label=""
              id={colorName}
              propertyName={colorName}
              value={item[colorName]}
              width={getWidth("colorPicker", 24)}
              onChange={(value) => {
                itemOnChange({ ...item, [colorName]: value }, undefined);
              }}
            />
            <Select
              size="small"
              variant="borderless"
              showSearch
              value={item[colorName]}
              onChange={(value) => {
                itemOnChange({ ...item, [colorName]: value }, undefined);
              }}
              popupMatchSelectWidth={false}
              style={{ width: 'max-content' }}
              labelRender={() => {
                return '';
              }}
              disabled={readOnly}
            >
              {Array.isArray(dropdownOptions) ? dropdownOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              )) : dropdownOptions}
            </Select>
          </Row>
          <InputComponent
            type="iconPicker"
            placeholder={iconTitle}
            readOnly={readOnly}
            size="small"
            label=""
            id={iconName}
            propertyName={iconName}
            value={item[iconName]}
            iconSize={16}
            width={getWidth("iconPicker", 24)}
            onChange={(value) => {
              itemOnChange({ ...item, [iconName]: value }, undefined);
            }}
          />
        </div>
      )}
    </ListEditor>
  );
};
