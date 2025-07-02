import { IToolboxComponent } from '@/interfaces';
import { ISizableColumnComponentProps, ISizableColumnInputProps } from './interfaces';
import { BorderHorizontalOutlined } from '@ant-design/icons';
import React, { CSSProperties, Fragment, useEffect, useMemo, useState } from 'react';
import { useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import ComponentsContainer from '@/components/formDesigner/containers/componentsContainer';
import { getLayoutStyle, getStyle, pickStyleFromModel } from '@/providers/form/utils';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import ParentProvider from '@/providers/parentProvider/index';
import { SizableColumns } from '@/components/sizableColumns';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { removeComponents } from '../_common-migrations/removeComponents';
import { getDimensionsStyle } from '../_settings/utils/dimensions/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { getBackgroundStyle } from '../_settings/utils/background/utils';
import { ValidationErrors } from '@/components';
import { jsonSafeParse, removeUndefinedProps } from '@/utils/object';
import { isValidGuid } from '@/components/formDesigner/components/utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { defaultStyles } from './utils';
import { getSettings } from './settingsForm';

const SizableColumnsComponent: IToolboxComponent<ISizableColumnComponentProps> = {
  type: 'sizableColumns',
  isInput: false,
  name: 'SizableColumns',
  icon: <BorderHorizontalOutlined />,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { globalState } = useGlobalState();
    const { columns } = model as ISizableColumnComponentProps;
    const style = { ...getLayoutStyle(model, { data, globalState }), display: 'flex' };

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
      const fetchStyles = async () => {
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
    const styling = jsonSafeParse(model.stylingBox || '{}');
    const stylingBoxAsCSS = pickStyleFromModel(styling);
    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...style,
      ...stylingBoxAsCSS,
      ...dimensionsStyles,
      ...borderStyles,
      ...backgroundStyles,
      ...shadowStyles
    });

    const finalStyle = removeUndefinedProps({ ...additionalStyles, fontWeight: Number(model?.font?.weight?.split(' - ')[0]) || 400 });

    return (
      <ParentProvider model={model}>
        <SizableColumns
          key={`split-${columns?.length}`}
          cursor="col-resize"
          style={finalStyle}
          sizes={columns?.map((col) => col.size)}
        >
          {columns &&
            columns.map((col) => (
              <Fragment key={col.id}>
                <ComponentsContainer
                  containerId={col.id}
                  dynamicComponents={
                    model?.isDynamic ? col?.components : []
                  }
                />
              </Fragment>
            ))}

        </SizableColumns>
      </ParentProvider>
    );
  },
  initModel: (model) => {
    const { dimensions, ...rest } = defaultStyles();
    const tabsModel: ISizableColumnComponentProps = {
      ...model,
      ...rest,
    };

    return tabsModel;
  },
  settingsFormMarkup: (data) => getSettings(data),
  migrator: (m) => m
    .add<ISizableColumnComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)) as ISizableColumnComponentProps)
    .add<ISizableColumnComponentProps>(1, (prev) => ({ ...migrateFormApi.properties(prev) }))
    .add<ISizableColumnComponentProps>(2, (prev) => removeComponents(prev))
    .add<ISizableColumnComponentProps>(3, (prev) => {
      const columns = prev.columns.map(c => ({
        ...c,
        components: c.components.map(c => ({
          ...c,
          propertyName: c.propertyName || c.id
        }))
      }));

      return {
        ...prev,
        columns
      };
    })
    .add<ISizableColumnComponentProps>(4, (prev) => {
      const styles: ISizableColumnInputProps = {
        size: prev.size,
        width: prev.width,
        height: prev.height,
        hideBorder: prev.hideBorder,
        borderSize: prev.borderSize,
        borderRadius: prev.borderRadius,
        borderColor: prev.borderColor,
        backgroundColor: prev.backgroundColor,
        stylingBox: prev.stylingBox,
      };
      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<ISizableColumnComponentProps>(5, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
  customContainerNames: ['columns'],
};

export default SizableColumnsComponent;