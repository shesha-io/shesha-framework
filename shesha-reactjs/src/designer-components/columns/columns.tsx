import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName, migrateStylingBoxToJson } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IFormComponentContainer } from '@/providers';
import ParentProvider from '@/providers/parentProvider/index';
import { SplitCellsOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { removeComponents } from '../_common-migrations/removeComponents';
import { ColumnsComponentDefinition, IColumnProps, IColumnsComponentProps, IColumnsInputProps } from './interfaces';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { nanoid } from '@/utils/uuid';
import { getFullSizeWrapperDesignerStyle } from '@/components/formDesigner/utils/stylingUtils';
import { useStyles } from './styles';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { useEvents } from '@/components/formDesigner/components/eventsAndApiValueProcessor';
import { getComponentEvents } from '../_common/events';
import { useMemo } from 'react';

// Validation function to ensure columns don't exceed 24-column limit
const validateColumns = (columns: IColumnProps[] | undefined): IColumnProps[] => {
  if (!isDefined(columns) || columns.length === 0) return [];

  const totalFlex = columns.reduce((sum, col) => sum + (col.flex || 0), 0);
  // If total is exactly 24 or less, no normalization needed
  if (totalFlex <= 24) return columns;

  console.warn(`Columns component: Total flex value (${totalFlex}) exceeds 24. Columns will wrap to new rows.`);
  return columns;
};

const ColumnsComponent: ColumnsComponentDefinition = {
  styleGroup: 'common-containers',
  showInThemeEditor: false,
  allowInherit: true,
  type: 'columns',
  isInput: false,
  name: 'Columns',
  icon: <SplitCellsOutlined />,
  getWrapperStyle: (model) => getFullSizeWrapperDesignerStyle(model),
  Factory: ({ model, form }) => {
    const { styles } = useStyles(model);
    const handleEvent = useEvents<void>(model.componentName);
    const events = useMemo(() => getComponentEvents<void>(model, ['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'], { handleEvent }), [handleEvent, model]);

    const { columns, gutterX = 0, gutterY = 0 } = model as IColumnsComponentProps;

    if (model.hidden === true) return null;

    // Validate and normalize columns to prevent overflow
    const validatedColumns = validateColumns(columns);

    return (
      <div className={styles.shaColumnComponent} style={model.styleCss} {...events}>
        <Row gutter={[gutterX || 0, gutterY || 0]} style={{ marginLeft: 0, marginRight: 0 }}>
          <ParentProvider model={model} name={`Columns-${model.id}`}>
            {validatedColumns.map((col, index) => (
              <Col key={index} md={col.flex} offset={col.offset} pull={col.pull} push={col.push}>
                {
                  form.formMode === 'designer'
                    ? <div className={styles.shaColumnDesignerWrapper}><ComponentsContainer containerId={col.id} dynamicComponents={model.isDynamic === true ? col.components : []} /></div>
                    : <ComponentsContainer containerId={col.id} dynamicComponents={model.isDynamic === true ? col.components : []} />
                }
              </Col>
            ))}
          </ParentProvider>
        </Row>
      </div>
    );
  },
  getDefaultStyles: defaultStyles,
  initModel: (model) => {
    const tabsModel: IColumnsComponentProps = {
      ...model,
      propertyName: 'custom Name',
      columns: [
        { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: [] },
        { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: [] },
      ],
      gutterX: 12,
      gutterY: 12,
    };

    return tabsModel;
  },
  migrator: (m) => m
    .add<IColumnsComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)) as IColumnsComponentProps)
    .add<IColumnsComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IColumnsComponentProps>(2, (prev) => removeComponents(prev))
    .add<IColumnsComponentProps>(3, (prev) => {
      const columns = (prev.columns ?? []).map((c) => ({
        ...c,
        components: c.components.map((c) => ({ ...c, propertyName: isNullOrWhiteSpace(c.propertyName) ? c.id : c.propertyName })),
      }));

      return { ...prev, columns };
    })
    .add<IColumnsComponentProps>(4, (prev, ctx) => {
      if (ctx.isNew === true) return prev;
      const styles: IColumnsInputProps = {
        width: prev.width,
        height: prev.height,
        hideBorder: prev.hideBorder,
        borderSize: prev.borderSize,
        borderColor: prev.borderColor,
        backgroundColor: prev.backgroundColor,
        stylingBox: prev.stylingBox,
        borderRadius: prev.borderRadius,
        border: { radius: { all: prev.borderRadius } },
      };
      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<IColumnsComponentProps>(5, (prev, ctx) => ctx.isNew === true ? prev : { ...migratePrevStyles(prev, defaultStyles()) })
    .add<IColumnsComponentProps>(6, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(migrateStylingBoxToJson(prev)))),
  settingsFormMarkup: getSettings,
  customContainerNames: ['columns'],
  getContainers: (model) => {
    return (model.columns ?? []).map<IFormComponentContainer>((t) => ({ id: t.id }));
  },
  previewConfiguration: {
    columns: [
      { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: [{ type: 'textField', id: 'textField', label: 'Text field' }] },
      { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: [{ type: 'numberField', id: 'numberField', label: 'Number field' }] },
    ],
    gutterX: 12,
    gutterY: 12,
    type: 'columns',
    id: 'columns',
    version: 'latest',
  },
};

export default ColumnsComponent;
