import { FormOutlined } from '@ant-design/icons';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import { ConfigurableFormItem } from '@/components';
import {
  getStyle,
  IToolboxComponent,
  useForm,
  useSheshaApplication,
  validateConfigurableComponentSettings,
} from '@/index';
import { Alert } from 'antd';
import KanbanReactComponent from '@/components/kanban';
import { IKanbanProps } from '@/components/kanban/model';
import { RefListItemGroupConfiguratorProvider } from '@/providers/refList/provider';
import { getSettings } from './settingsForm';
import { getFontStyle } from '../_settings/utils/font/utils';
import { removeUndefinedProps } from '@/utils/object';
import { getBackgroundImageUrl, getBackgroundStyle } from '../_settings/utils/background/utils';
import { getShadowStyle } from '../_settings/utils/shadow/utils';
import { getBorderStyle } from '../_settings/utils/border/utils';

const KanbanComponent: IToolboxComponent<IKanbanProps> = {
  type: 'kanban',
  isInput: false,
  name: 'Kanban',
  icon: <FormOutlined />,

  Factory: ({ model }) => {
    const { httpHeaders, backendUrl } = useSheshaApplication();
    const data = model;
    const form = useForm();
    const font = model?.font;
    const shadow = model?.shadow;
    const border = model?.border;
    const background = model?.background;
    const columnBackground = model?.columnBackground;
    const headerStyle = getStyle(model?.headerStyles as string, data);
    const columnStyle = getStyle(model?.columnStyle as string, data);
    const fontStyles = useMemo(() => getFontStyle(font), [font]);
    const borderStyles = useMemo(() => getBorderStyle(border, headerStyle), [border, headerStyle]);
    const shadowStyles = useMemo(() => getShadowStyle(shadow), [shadow]);

    const [backgroundStyles, setBackgroundStyles] = useState({});
    const [columnBackgroundStyle, setColumnBackgroundStyle] = useState({});

    useEffect(() => {
      const fetchStyles = async () => {
        getBackgroundImageUrl(background, backendUrl, httpHeaders)
          .then(async (url) => {
            return await getBackgroundStyle(background, headerStyle, url);
          })
          .then((style) => {
            setBackgroundStyles(style);
          });
      };
      fetchStyles();
    }, [background, backendUrl, httpHeaders]);

    useEffect(() => {
      const fetchStyles = async () => {
        getBackgroundImageUrl(columnBackground, backendUrl, httpHeaders)
          .then(async (url) => {
            return await getBackgroundStyle(columnBackground, columnStyle, url);
          })
          .then((style) => {
            setColumnBackgroundStyle(style);
          });
      };
      fetchStyles();
    }, [columnBackground, backendUrl, httpHeaders]);


    const additionalColumnStyles: CSSProperties = removeUndefinedProps({
      ...columnBackgroundStyle,
      ...columnStyle,
    });

    const additionalHeaderStyles: CSSProperties = removeUndefinedProps({
      ...borderStyles,
      ...fontStyles,
      ...backgroundStyles,
      ...shadowStyles,
      ...headerStyle,
    });

    if (form.formMode === 'designer' && !model.entityType) {
      return (
        <Alert
          showIcon
          message="Kanban not configured properly"
          description="Please make sure that you've specified 'entityType' property."
          type="warning"
        />
      );
    }
    return (
      <div>
        <ConfigurableFormItem model={model}>
          {(value) => {
            return (
              <RefListItemGroupConfiguratorProvider
                value={value}
                items={model.items}
                referenceList={model.referenceList}
                readOnly={model.readOnly}
              >
                <KanbanReactComponent {...model} headerStyles={additionalHeaderStyles} columnStyle={additionalColumnStyles}/>
              </RefListItemGroupConfiguratorProvider>
            );
          }}
        </ConfigurableFormItem>
      </div>
    );
  },
  initModel: (model) => ({
    ...model,
    hideLabel: true,
  }),
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default KanbanComponent;
