import { GroupOutlined } from '@ant-design/icons';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import ParentProvider from '@/providers/parentProvider/index';
import { getFullSizeWrapperDesignerStyle } from '@/components/formDesigner/utils/stylingUtils';
import { useActualContextExecutionNoRefresh } from '@/hooks/formComponentHooks';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { useStyles } from './styles';
import { CustomLayoutComponentDefinition } from './interfaces';

const CustomLayoutComponent: CustomLayoutComponentDefinition = {
  showInThemeEditor: false,
  styleGroup: 'common-containers',
  allowInherit: true,
  type: 'customLayout',
  isInput: false,
  name: 'Custom Layout',
  icon: <GroupOutlined />,
  emptyComponents: [],
  getWrapperStyle: (model) => getFullSizeWrapperDesignerStyle(model),
  Factory: ({ model }) => {
    const { styles, cx } = useStyles(model);
    const wrappedStyleJson = useActualContextExecutionNoRefresh(model.wrapperStyle, undefined, {});

    if (model.hidden === true) return null;

    return (
      <ParentProvider model={model} name={`CustomLayoutComponent-${model.id}`}>
        {model.hideLabel !== true && <div className={styles.heading}>{model.label}</div>}
        <ComponentsContainer
          containerId={model.id}
          wrapperStyle={wrappedStyleJson}
          style={model.styleCss}
          className={cx(model.className, styles.customLayout)}
          dynamicComponents={model.isDynamic === true ? model.components : CustomLayoutComponent.emptyComponents}
        />
      </ParentProvider>
    );
  },
  initModel: (model) => ({
    ...model,
    label: 'Custom Layout',
    hideLabel: false,
    labelAlign: 'left',
    // Set explicitly so the heading does not inherit colour from the surrounding chrome.
    headingFont: { color: '#000', size: 14, weight: '500' },
  }),
  settingsFormMarkup: getSettings,
  getDefaultStyles: defaultStyles,
};

export default CustomLayoutComponent;
