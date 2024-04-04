import { IToolboxComponent } from '@/interfaces';
import { useFormData, useGlobalState } from '@/providers';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { executeFunction } from '@/utils';
import { nanoid } from '@/utils/uuid';
import { HighlightOutlined } from '@ant-design/icons';
import parse from 'html-react-parser';
import React from 'react';
import { IHtmlComponentProps } from './interfaces';
import { getSettings } from './settingsForm';

const HTMLComponent: IToolboxComponent<IHtmlComponentProps> = {
  type: 'htmlRender',
  name: 'HTML Render',
  icon: <HighlightOutlined />,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { globalState } = useGlobalState();

    return parse(executeFunction(model?.renderer, { data, globalState }) || '<div><div/>');
  },
  initModel: (model) => ({
    ...model,
    header: { id: nanoid(), components: [] },
    content: { id: nanoid(), components: [] },
  }),
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default HTMLComponent;
