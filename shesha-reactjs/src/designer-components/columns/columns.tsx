import { ValidationErrors } from '@/components';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IToolboxComponent } from '@/interfaces';
import { IFormComponentContainer, StyleBoxValue, useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { getLayoutStyle, getStyle, pickStyleFromModel } from '@/providers/form/utils';
import ParentProvider from '@/providers/parentProvider/index';
import { jsonSafeParse, removeUndefinedProps } from '@/utils/object';
import { SplitCellsOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { removeComponents } from '../_common-migrations/removeComponents';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getDimensionsStyle } from '../_settings/utils/dimensions/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { IColumnProps, IColumnsComponentProps, IColumnsInputProps } from './interfaces';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { nanoid } from '@/utils/uuid';
import { Property } from 'csstype';

// Validation function to ensure columns don't exceed 24-column limit
const validateColumns = (columns: IColumnProps[]): IColumnProps[] => {
  if (!columns || columns.length === 0) return [];

  const totalFlex = columns.reduce((sum, col) => sum + (col.flex || 0), 0);

  // If total is exactly 24 or less, no normalization needed
  if (totalFlex <= 24) {
    return columns;
  }

  console.warn(`Columns component: Total flex value (${totalFlex}) exceeds 24. Columns will wrap to new rows.`);

  return columns;
};

const ColumnsComponent: IToolboxComponent<IColumnsComponentProps> = {
  type: 'columns',
  isInput: false,
  name: 'Columns',
  icon: <SplitCellsOutlined />,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { globalState } = useGlobalState();
    const { columns, gutterX = 0, gutterY = 0 } = model as IColumnsComponentProps;

    const { backendUrl, httpHeaders } = useSheshaApplication();

    const dimensions = model?.dimensions;
    const border = model?.border;
    const shadow = model?.shadow;
    const background = model?.background;
    const jsStyle = getStyle(model.style, data);

    const dimensionsStyles = useMemo(() => getDimensionsStyle(dimensions), [dimensions]);
    const borderStyles = useMemo(() => getBorderStyle(border, jsStyle), [border]);
    const [backgroundStyles, setBackgroundStyles] = useState({});
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);

    useEffect(() => {
      const fetchStyles = async (): Promise<void> => {
        const storedImageUrl = background?.storedFile?.id && background?.type === 'storedFile'
          ? await fetch(`${backendUrl}/api/StoredFile/Download?id=${background?.storedFile?.id}`,
            { headers: { ...httpHeaders, "Content-Type": "application/octet-stream" } })
            .then((response) => {
              return response.blob();
            })
            .then((blob) => {
              return URL.createObjectURL(blob);
            }) : '';

        const style = await getBackgroundStyle(background, jsStyle, storedImageUrl);
        setBackgroundStyles(style);
      };

      fetchStyles();
    }, [background, background?.gradient?.colors, backendUrl, httpHeaders]);

    if (model.hidden) return null;

    if (model?.background?.type === 'storedFile' && model?.background.storedFile?.id && !isValidGuid(model?.background.storedFile.id)) {
      return <ValidationErrors error="The provided StoredFileId is invalid" />;
    }
    const styling = jsonSafeParse<StyleBoxValue>(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);
    const additionalStyles = removeUndefinedProps({
      ...stylingBoxAsCSS,
      ...dimensionsStyles,
      ...borderStyles,
      ...backgroundStyles,
      ...shadowStyles,
    });

    const finalStyle = removeUndefinedProps({ ...additionalStyles, fontWeight: Number(model?.font?.weight?.split(' - ')[0]) || 400 });

    // Add padding when border is configured to prevent border from touching components
    const hasBorder = border && !border.hideBorder && (
      (border.border?.all?.width && border.border.all.width !== '0px' && border.border.all.width !== 0 && border.border.all.width !== '0') ||
      (border.border?.top?.width && border.border.top.width !== '0px' && border.border.top.width !== 0 && border.border.top.width !== '0') ||
      (border.border?.right?.width && border.border.right.width !== '0px' && border.border.right.width !== 0 && border.border.right.width !== '0') ||
      (border.border?.bottom?.width && border.border.bottom.width !== '0px' && border.border.bottom.width !== 0 && border.border.bottom.width !== '0') ||
      (border.border?.left?.width && border.border.left.width !== '0px' && border.border.left.width !== 0 && border.border.left.width !== '0')
    );


    const hPad = `${((gutterX || 0) / 2) + 8}px`;
    const vPadTop = `${((gutterY || 0) / 2) + 8}px`;
    const vPadBottom = `${((gutterY || 0) / 2) + 3}px`; // keep the reduced bottom margin intent
    const containerPadding = hasBorder
      ? { paddingTop: vPadTop, paddingLeft: hPad, paddingRight: hPad, paddingBottom: vPadBottom }
      : {};
    const boxSizing = hasBorder ? { boxSizing: 'border-box' as Property.BoxSizing } : {};
    // Validate and normalize columns to prevent overflow
    const validatedColumns = validateColumns(columns);

    return (
      <div style={{ ...getLayoutStyle(model, { data, globalState }), ...containerPadding, ...boxSizing, ...finalStyle }}>
        <Row gutter={[gutterX || 0, gutterY || 0]}>
          <ParentProvider model={model}>
            {validatedColumns &&
              validatedColumns.map((col, index) => (
                <Col
                  key={index}
                  md={col.flex}
                  offset={col.offset}
                  pull={col.pull}
                  push={col.push}
                >
                  <ComponentsContainer
                    containerId={col.id}
                    dynamicComponents={model?.isDynamic ? col?.components : []}
                  />
                </Col>
              ))}
          </ParentProvider>
        </Row>
      </div>
    );
  },
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
      stylingBox: "{\"marginBottom\":\"5\"}",
    };

    return tabsModel;
  },
  migrator: (m) =>
    m
      .add<IColumnsComponentProps>(
        0,
        (prev) => migratePropertyName(migrateCustomFunctions(prev)) as IColumnsComponentProps,
      )
      .add<IColumnsComponentProps>(1, (prev) => migrateVisibility(prev))
      .add<IColumnsComponentProps>(2, (prev) => removeComponents(prev))
      .add<IColumnsComponentProps>(3, (prev) => {
        const columns = prev.columns.map((c) => ({
          ...c,
          components: c.components.map((c) => ({
            ...c,
            propertyName: c.propertyName || c.id,
          })),
        }));

        return {
          ...prev,
          columns,
        };
      })
      .add<IColumnsComponentProps>(4, (prev) => {
        const styles: IColumnsInputProps = {
          width: prev.width,
          height: prev.height,
          hideBorder: prev.hideBorder,
          borderSize: prev.borderSize,
          borderColor: prev.borderColor,
          backgroundColor: prev.backgroundColor,
          stylingBox: prev.stylingBox,
          borderRadius: prev.borderRadius,
          border: {
            radius: {
              all: prev.borderRadius,
            },
          },
        };
        return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
      })
      .add<IColumnsComponentProps>(5, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
  settingsFormMarkup: (data) => getSettings(data),
  customContainerNames: ['columns'],
  getContainers: (model) => {
    return model.columns.map<IFormComponentContainer>((t) => ({ id: t.id }));
  },
};

export default ColumnsComponent;
