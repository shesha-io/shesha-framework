import { IApiContext, IToolboxComponent } from "@/interfaces";
import { IComponentModelProps, IConfigurableFormComponent, UnwrapCodeEvaluators } from "@/providers";
import { memo, FC, useMemo } from "react";
import { useStyles } from "../styles/styles";
import { isDefined } from "@/utils/nullables";
import { isPropertySettings } from "@/designer-components/_settings/utils/utils";
import classNames from "classnames";
import { isNonEmptyArray } from "@/utils/array";
import Show from "@/components/show";
import { ConfigProvider, Tooltip, theme as antdTheme } from "antd";
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
import { useThemeState } from "@/providers/theme";
import { useFormDesignerComponentGetter } from "@/providers/form/hooks";
import { createPortal } from "react-dom";
import { ComponentProperties } from "../componentPropertiesPanel/componentProperties";
import { useComponentValidationResults } from "@/providers/validator/hooks";
import { getDesignerIndicators } from "./designerIndicators";
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
  const { resolvedTheme } = useThemeState();

  // Note: sourceComponentModel is intentionally NOT in dependencies to prevent focus loss
  // when typing in the properties panel. The portal is created once and the component
  // receives updates through its own internal state management.
  const settingsEditor = useMemo(() => {
    const renderRequired = isSelected && isDefined(settingsPanelElement);

    if (!renderRequired || !component)
      return null;

    const result = createPortal((
      <div onClick={(e) => e.stopPropagation()} onMouseOver={(e) => e.stopPropagation()} onMouseOut={(e) => e.stopPropagation()}>
        {/* The portal moves this into the properties panel, but React context still follows the
            component tree - so without this it would inherit the canvas's light-pinned theme. */}
        <ConfigProvider theme={{ algorithm: resolvedTheme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
          <ComponentProperties componentModel={sourceComponentModel} readOnly={readOnly} toolboxComponent={component} />
        </ConfigProvider>
      </div>
    ), settingsPanelElement, "propertiesPanel");
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected, settingsPanelElement, readOnly, component, resolvedTheme]);

  const { showPermissions, showCustomLogic, showHidden } = getDesignerIndicators(sourceComponentModel);

  const editModeFx = isPropertySettings(sourceComponentModel.editMode) && sourceComponentModel.editMode._mode === 'code';
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
        <Show when={showPermissions}>
          <Tooltip title="This field is hidden and disabled by permissions. It's shown and enabled here so you can configure it in the Form Builder.">
            <span className={styles.shaComponentIndicatorIcon}><LockOutlined /></span>
          </Tooltip>
        </Show>

        <Show when={showCustomLogic}>
          <Tooltip title="This field is hidden by custom logic. It's shown here so you can configure it in the Form Builder.">
            <span className={styles.shaComponentIndicatorIcon}><FunctionOutlined /></span>
          </Tooltip>
        </Show>

        <Show when={showHidden}>
          <Tooltip title="This field is set to hidden. It's shown here so you can configure it in the Form Builder.">
            <span className={styles.shaComponentIndicatorIcon}><EyeInvisibleOutlined /></span>
          </Tooltip>
        </Show>

        <Show when={!editModeFx && (editModeValue === 'readOnly' || editModeValue === false)}>
          <Tooltip title="This component is always in Read only mode">
            <span className={styles.shaComponentIndicatorIcon}><Icon icon="editLockIcon" /></span>
          </Tooltip>
        </Show>

        <Show when={!editModeFx && editModeValue === 'disabled'}>
          <Tooltip title="This component is always disabled">
            <span className={styles.shaComponentIndicatorIcon}><Icon icon="editDisableIcon" /></span>
          </Tooltip>
        </Show>

        <Show when={!editModeFx && editModeValue === 'editable'}>
          <Tooltip title="This component is always in Edit/Action mode">
            <span className={styles.shaComponentIndicatorIcon}><Icon icon="editIcon" /></span>
          </Tooltip>
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
