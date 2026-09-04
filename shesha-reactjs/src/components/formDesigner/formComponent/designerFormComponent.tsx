import { IApiContext, IToolboxComponent } from "@/interfaces";
import { IComponentModelProps, IConfigurableFormComponent, UnwrapCodeEvaluators } from "@/providers";
import { memo, FC, useMemo } from "react";
import { useStyles } from "../styles/styles";
import { isDefined } from "@/utils/nullables";
import { isPropertySettings } from "@/designer-components/_settings/utils/utils";
import classNames from "classnames";
import { isNonEmptyArray } from "@/utils/array";
import Show from "@/components/show";
import { Tooltip } from "antd";
import { EyeInvisibleOutlined, FunctionOutlined, LockOutlined } from "@ant-design/icons";
import DragWrapper from "../configurableFormComponent/dragWrapper";
import { useFormDesigner, useFormDesignerSelectedComponentId, useFormDesignerSettingsPanelElement } from "@/providers/formDesigner";
import KnownFormComponent from "./knownFormComponent";
import FormComponentErrorWrapper from "./formComponentErrorWrapper";
import { FormComponentModelPreparer } from "./formComponentModelPreparer";
import { UnknownFormComponent } from "./unknownFormComponent";
import { IFormComponentProps } from "./formComponent";
import Icon from "@/components/icon/Icon";
import { useShaComponentStyles } from "../styles/shaComponentStyles";
import { useFormDesignerComponentGetter } from "@/providers/form/hooks";
import { createPortal } from "react-dom";
import { ComponentProperties } from "../componentPropertiesPanel/componentProperties";
import { useComponentValidationResults } from "@/providers/validator/hooks";
export interface IDesignerFormComponentProps {
  componentModel: UnwrapCodeEvaluators<IComponentModelProps>;
  sourceComponentModel: IComponentModelProps;
  toolboxComponent: IToolboxComponent;
  apiContext: IApiContext<IConfigurableFormComponent>;
}

const DesignerFormComponentInner: FC<IDesignerFormComponentProps> = ({
  sourceComponentModel,
  componentModel,
  toolboxComponent,
  apiContext,
}) => {
  const { styles } = useStyles();
  const { styles: shaComponentStyles } = useShaComponentStyles({ componentModel, toolboxComponent, isDesigner: true });
  const { readOnly } = useFormDesigner();
  const settingsPanelElement = useFormDesignerSettingsPanelElement();
  const getToolboxComponent = useFormDesignerComponentGetter();
  const validationResults = useComponentValidationResults(componentModel.id);
  // Memoize component lookup to prevent unnecessary re-renders
  const component = useMemo(() => getToolboxComponent(componentModel.type), [getToolboxComponent, componentModel.type]);
  const selectedComponentId = useFormDesignerSelectedComponentId();
  const isSelected = Boolean(componentModel.id) && selectedComponentId === componentModel.id;

  // Note: sourceComponentModel is intentionally NOT in dependencies to prevent focus loss
  // when typing in the properties panel. The portal is created once and the component
  // receives updates through its own internal state management.
  const settingsEditor = useMemo(() => {
    const renderRequired = isSelected && isDefined(settingsPanelElement);

    if (!renderRequired || !component)
      return null;

    const result = createPortal((
      <div onClick={(e) => e.stopPropagation()} onMouseOver={(e) => e.stopPropagation()} onMouseOut={(e) => e.stopPropagation()}>
        <ComponentProperties componentModel={sourceComponentModel} readOnly={readOnly} toolboxComponent={component} />
      </div>
    ), settingsPanelElement, "propertiesPanel");
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected, settingsPanelElement, readOnly, component]);

  const hiddenFx = (isPropertySettings(sourceComponentModel.hidden) && sourceComponentModel.hidden._mode === 'code') || // ToDo: AS - remove hidden after migration all components
    (isPropertySettings(sourceComponentModel.visible) && sourceComponentModel.visible._mode === 'code');
  const editModeFx = isPropertySettings(sourceComponentModel.editMode) && sourceComponentModel.editMode._mode === 'code';
  const hiddenPs = isNonEmptyArray(sourceComponentModel.visiblePermissions);
  const editModePs = isNonEmptyArray(sourceComponentModel.editModePermissions);
  const hiddenCondition = hiddenFx || hiddenPs;
  const editModeCondition = editModeFx || editModePs;
  const fxCondition = hiddenFx || editModeFx;
  const psCondition = hiddenPs || editModePs;

  const actionText1 = (hiddenCondition ? 'hidden' : '') + (hiddenCondition && editModeCondition ? ' and ' : '') + (editModeCondition ? 'disabled' : '');
  const actionText2 = (fxCondition ? 'condition' : '') + (fxCondition && psCondition ? '/' : '') + (psCondition ? 'permissions' : '');
  const actionText3 = (hiddenCondition ? 'showing' : '') + (hiddenCondition && editModeCondition ? '/' : '') + (editModeCondition ? 'enabled' : '');

  const visibleValue = isPropertySettings(sourceComponentModel.visible) && sourceComponentModel.visible._mode === 'value'
    ? sourceComponentModel.visible._value !== false
    : sourceComponentModel.visible !== false;
  const hiddenValue = isPropertySettings(sourceComponentModel.hidden) && sourceComponentModel.hidden._mode === 'value'
    ? sourceComponentModel.hidden._value === true
    : sourceComponentModel.hidden === true;

  const editModeValue = isPropertySettings(sourceComponentModel.editMode) && sourceComponentModel.editMode._mode === 'value'
    ? sourceComponentModel.editMode._value
    : sourceComponentModel.editMode;

  return (
    <DragWrapper
      componentId={componentModel.id}
      readOnly={readOnly}
      className={classNames(shaComponentStyles.shaComponent, shaComponentStyles.componentDragHandle,
        {
          [styles.selectedComponent]: isSelected,
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          [styles.hasConfigErrors]: false && isNonEmptyArray(validationResults),
        })}
    >
      <span className={styles.shaComponentIndicator}>
        <Show when={fxCondition || psCondition}>
          <Tooltip title={`This component is ${actionText1} by ${actionText2}. It's now ${actionText3} because we're in a designer mode`}>
            {fxCondition && <FunctionOutlined />}
            {psCondition && <LockOutlined />}
          </Tooltip>
        </Show>

        <Show when={!hiddenFx && (!visibleValue || hiddenValue)}>
          <Tooltip title="This component is hidden. It's now showing because we're in a designer mode"><EyeInvisibleOutlined /></Tooltip>
        </Show>

        <Show when={!editModeFx && (editModeValue === 'readOnly' || editModeValue === false)}>
          <Tooltip title="This component is always in Read only mode"><Icon icon="editLockIcon" /></Tooltip>
        </Show>

        <Show when={!editModeFx && editModeValue === 'disabled'}>
          <Tooltip title="This component is always disabled"><Icon icon="editDisableIcon" /></Tooltip>
        </Show>

        <Show when={!editModeFx && editModeValue === 'editable'}>
          <Tooltip title="This component is always in Edit/Action mode"><Icon icon="editIcon" /></Tooltip>
        </Show>
      </span>

      <KnownFormComponent componentModel={componentModel} toolboxComponent={toolboxComponent} apiContext={apiContext} />

      {settingsEditor}

    </DragWrapper>
  );
};

const DesignerFormComponentInnerMemo = memo(DesignerFormComponentInner);

const DesignerFormComponent: FC<IFormComponentProps> = ({ componentModel }) => {
  return (
    <FormComponentErrorWrapper componentModel={componentModel}>
      <FormComponentModelPreparer componentModel={componentModel}>
        {(componentModelPrepared, toolboxComponent, apiContext) => {
          return isDefined(toolboxComponent)
            ? <DesignerFormComponentInnerMemo sourceComponentModel={componentModel} componentModel={componentModelPrepared} toolboxComponent={toolboxComponent} apiContext={apiContext} />
            : <UnknownFormComponent componentModel={componentModel} />;
        }}
      </FormComponentModelPreparer>
    </FormComponentErrorWrapper>
  );
};

const DesignerFormComponentMemo = memo(DesignerFormComponent);

export default DesignerFormComponentMemo;
