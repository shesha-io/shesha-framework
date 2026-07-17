import ConditionalWrap from '@/components/conditionalWrapper';
import React, { FC, Fragment, ReactElement, useState } from 'react';
import Show from '@/components/show';
import {
  Alert,
  Button,
  Col,
  Input,
  Modal,
  Row,
  Tabs,
} from 'antd';
import { BorderlessTableOutlined } from '@ant-design/icons';
import { CodeVariablesTables, ICodeExposedVariable } from '@/components/codeVariablesTable';
import { ILabelValueEditorPropsBase } from './interfaces';
import { ListEditor } from '@/components/listEditor';
import { ItemChangeDetails } from '../listEditor';
import { getStringPropertyOrUndefined } from '@/utils/object';
import { isDefined } from '@/utils/nullables';
import { ExpressionContext, ExpressionEditor } from '@/components/expressionEditor';
import { useExpressionEditorContext } from '@/components/expressionEditor/useExpressionEditorContext';

export interface ILabelValueItem {
  [key: string]: string;
}

export interface ILabelValueEditorProps extends ILabelValueEditorPropsBase {
  /**
   * Selected value
   */
  value?: ILabelValueItem[] | undefined;

  /**
   * On change event handler
   */
  onChange?: ((newValue: ILabelValueItem[]) => void) | undefined;

  mode?: 'dialog' | 'inline' | undefined;

  exposedVariables?: ICodeExposedVariable[] | undefined;

  description?: string | undefined;

  readOnly?: boolean | undefined;
}

interface InputPropertyEditorProps<TItem> {
  item: TItem;
  itemOnChange: (newValue: TItem, changeDetails?: ItemChangeDetails) => void;
  readOnly: boolean;
  placeholder?: string | undefined;
  propertyName: string;
}
export const InputPropertyEditor = <TItem extends object>(props: InputPropertyEditorProps<TItem>): ReactElement => {
  const { item, propertyName, itemOnChange, placeholder } = props;
  return (
    <Input
      placeholder={placeholder}
      title={placeholder}
      value={getStringPropertyOrUndefined(item, propertyName) ?? ""}
      onChange={(e) => {
        itemOnChange({ ...item, [propertyName]: e.target.value }, { isReorder: false });
      }}
    />
  );
};

interface ExpressionValueCellProps<TItem> extends InputPropertyEditorProps<TItem> {
  /** Shared autocomplete context, built once by the parent and reused by every value cell. */
  context: ExpressionContext;
}

/**
 * Value-column cell backed by the mustache-aware ExpressionEditor. The autocomplete context is
 * built once by {@link ExpressionLabelValueList} and passed in, so adding N rows no longer rebuilds
 * the (partly async) metadata context N times.
 */
const ExpressionValueCell = <TItem extends object>(props: ExpressionValueCellProps<TItem>): ReactElement => {
  const { item, propertyName, itemOnChange, readOnly, placeholder, context } = props;
  return (
    <ExpressionEditor
      value={getStringPropertyOrUndefined(item, propertyName) ?? ''}
      onChange={(newValue) => {
        itemOnChange({ ...item, [propertyName]: newValue }, { isReorder: false });
      }}
      context={context}
      placeholder={placeholder}
      disabled={readOnly}
      focusRows={6}
      inline
      allowExpand
    />
  );
};

const EMPTY_VALUE: ILabelValueItem[] = [];

interface ILabelValueListProps {
  value?: ILabelValueItem[] | undefined;
  onChange: (newValue: ILabelValueItem[]) => void;
  labelName: string;
  valueName: string;
  labelTitle?: string | undefined;
  valueTitle?: string | undefined;
  readOnly: boolean;
  valueEditor: 'input' | 'expression';
  /** Present only in expression mode; the shared context reused by every value cell. */
  expressionContext?: ExpressionContext | undefined;
}

const LabelValueList: FC<ILabelValueListProps> = ({
  value,
  onChange,
  labelName,
  valueName,
  labelTitle,
  valueTitle,
  readOnly,
  valueEditor,
  expressionContext,
}) => (
  <ListEditor<ILabelValueItem>
    value={value ?? EMPTY_VALUE}
    onChange={onChange}
    initNewItem={(_items) => ({
      [labelName]: '',
      [valueName]: '',
    })}
    readOnly={readOnly}
  >
    {({ item, itemOnChange, readOnly }) => {
      return (
        <Row>
          <Col span={12}>
            <InputPropertyEditor<ILabelValueItem> item={item} itemOnChange={itemOnChange} propertyName={labelName} readOnly={readOnly} placeholder={labelTitle} />
          </Col>
          <Col span={12}>
            {valueEditor === 'expression'
              ? <ExpressionValueCell<ILabelValueItem> item={item} itemOnChange={itemOnChange} propertyName={valueName} readOnly={readOnly} placeholder={valueTitle} context={expressionContext ?? {}} />
              : <InputPropertyEditor<ILabelValueItem> item={item} itemOnChange={itemOnChange} propertyName={valueName} readOnly={readOnly} placeholder={valueTitle} />}
          </Col>
        </Row>
      );
    }}
  </ListEditor>
);

/**
 * Expression-mode variant. Builds the autocomplete context once and hands it to the list, so the
 * (partly async) context work runs a single time regardless of how many rows exist. Mounted only in
 * expression mode, keeping the metadata/constants hooks off the plain-input path entirely.
 */
const ExpressionLabelValueList: FC<Omit<ILabelValueListProps, 'expressionContext'>> = (props) => {
  const expressionContext = useExpressionEditorContext();
  return <LabelValueList {...props} expressionContext={expressionContext} />;
};

const LabelValueEditor: FC<ILabelValueEditorProps> = ({
  value,
  onChange,
  labelTitle,
  labelName = "label",
  valueTitle,
  valueName = "value",
  description,
  mode = 'dialog',
  exposedVariables,
  readOnly = false,
  valueEditor = 'input',
}) => {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = (): void => setShowModal((currentVisible) => !currentVisible);

  if (!isDefined(onChange))
    return undefined;

  const listProps: Omit<ILabelValueListProps, 'expressionContext'> = {
    value,
    onChange,
    labelName,
    valueName,
    labelTitle,
    valueTitle,
    readOnly,
    valueEditor,
  };

  return (
    <ConditionalWrap
      condition={mode === 'dialog'}
      wrap={(children) => (
        <Fragment>
          <Button onClick={toggleModal} size="small" icon={<BorderlessTableOutlined />}>
            {readOnly ? 'Click to View Items' : 'Click to Add Items'}
          </Button>

          <Modal
            title={readOnly ? 'View Items' : 'Add Items'}
            open={showModal}
            width={650}

            onOk={toggleModal}
            okButtonProps={{ hidden: readOnly }}

            onCancel={toggleModal}
            cancelText={readOnly ? 'Close' : undefined}
          >
            <Show when={!!description}>
              <Alert type="info" title={description} />
              <br />
            </Show>
            <Tabs
              items={[
                { key: "keyValuePairs", label: "Key/Value pairs", children: children },
                { key: "variable", label: "Variables", children: <CodeVariablesTables data={exposedVariables} /> },
              ]}
            />
          </Modal>
        </Fragment>
      )}
    >
      {valueEditor === 'expression'
        ? <ExpressionLabelValueList {...listProps} />
        : <LabelValueList {...listProps} />}
    </ConditionalWrap>
  );
};

export { LabelValueEditor };
