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
import { EyeInvisibleOutlined, FunctionOutlined } from "@ant-design/icons";
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

  const hiddenFx = isPropertySettings(componentModel.hidden);
  const componentEditModeFx = isPropertySettings(componentModel.editMode);

  const actionText1 = (hiddenFx ? 'hidden' : '') + (hiddenFx && componentEditModeFx ? ' and ' : '') + (componentEditModeFx ? 'disabled' : '');
  const actionText2 = (hiddenFx ? 'showing' : '') + (hiddenFx && componentEditModeFx ? '/' : '') + (componentEditModeFx ? 'enabled' : '');

  return (
    <DragWrapper
      componentId={componentModel.id}
      readOnly={readOnly}
      className={classNames(shaComponentStyles.shaComponent, shaComponentStyles.componentDragHandle,
        {
          [styles.selectedComponent]: isSelected,
          [styles.hasConfigErrors]: isNonEmptyArray(validationResults),
        })}
    >
      <span className={styles.shaComponentIndicator}>
        <Show when={hiddenFx || componentEditModeFx}>
          <Tooltip title={`This component is ${actionText1} by condition. It's now ${actionText2} because we're in a designer mode`}><FunctionOutlined /></Tooltip>
        </Show>

        <Show when={!hiddenFx && (componentModel.hidden === true || componentModel.visible === false)}>
          <Tooltip title="This component is hidden. It's now showing because we're in a designer mode"><EyeInvisibleOutlined /></Tooltip>
        </Show>

        <Show when={!componentEditModeFx && (componentModel.editMode === 'readOnly' || componentModel.editMode === false)}>
          <Tooltip title="This component is always in Read only mode"><Icon icon="editLockIcon" /></Tooltip>
        </Show>

        <Show when={!componentEditModeFx && componentModel.editMode === 'disabled'}>
          <Tooltip title="This component is always disabled"><Icon icon="editDisableIcon" /></Tooltip>
        </Show>

        <Show when={!componentEditModeFx && componentModel.editMode === 'editable'}>
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
