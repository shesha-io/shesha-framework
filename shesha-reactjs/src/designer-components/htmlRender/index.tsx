import { IToolboxComponent } from '@/interfaces';
import { executeScriptSync } from '@/providers/form/utils';
import { HighlightOutlined } from '@ant-design/icons';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import { IHtmlComponentProps } from './interfaces';
import { getSettings } from './settingsForm';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { addContextData } from '@/components/formDesigner/components/utils';
import { isNullOrWhiteSpace } from '@/utils';
import { migratePermissionsToVisiblePermissions } from '../_common-migrations/migratePermissionsToVisiblePermissions';
import { migrateHiddenToVisible } from '../_common-migrations';
import { useEvents } from '@/components/formDesigner/components/eventsAndApiValueProcessor';
import { getComponentEvents } from '../_common/events';
import { Empty } from 'antd';

interface IHtmlComponentCalulatedModel {
  getContent: (value: string | undefined) => string;
}

const HtmlComponent: IToolboxComponent<IHtmlComponentProps, IHtmlComponentCalulatedModel> = {
  type: 'htmlRender',
  name: 'HTML Render',
  icon: <HighlightOutlined />,
  isInput: false,
  isOutput: true,
  getWrapperStyle: () => ({ style: { dimensions: { height: 'fit-content', width: 'fit-content' } } }),
  calculateModel: (model, allData) => ({
    getContent: (value: string | undefined) => isNullOrWhiteSpace(model.renderer) ? '' : executeScriptSync(model.renderer, addContextData(allData, { value })) ?? '',
  }),
  Factory: ({ model, calculatedModel }) => {
    const handleEvent = useEvents<void>(model.componentName);
    return (
      <div style={model.styleCss}>
        <ConfigurableFormItem<string> model={{ ...model, hideLabel: true }}>
          {(value) => {
            const html = (model.contentType === 'html' ? model.html : calculatedModel.getContent(value ?? undefined)) ?? '';
            const content = model.sanitize === false ? html : DOMPurify.sanitize(html);
            return (
              <div {...getComponentEvents<void, IHtmlComponentProps>(model, ['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseMove', 'onMouseLeave'], { handleEvent })}>
                {isNullOrWhiteSpace(content) ? <Empty description="Please, provide some content for this HTML render" /> : parse(content)}
              </div>
            );
          }}
        </ConfigurableFormItem>
      </div>
    );
  },
  settingsFormMarkup: getSettings,

  initModel: (model) => ({
    ...model,
    contentType: model.contentType ?? 'jsx',
    sanitize: model.sanitize ?? true,
  }),
  migrator: (m) => m
    .add<IHtmlComponentProps>(1, (prev: IHtmlComponentProps) => ({
      ...migrateFormApi.properties(prev),
      renderer: migrateFormApi.withoutFormData(prev.renderer),
    }))
    .add<IHtmlComponentProps>(2, (prev) => ({
      ...prev,
      sanitize: prev.sanitize ?? true,
      contentType: prev.contentType ?? 'jsx',
      ...migratePermissionsToVisiblePermissions(migrateHiddenToVisible(prev)),
    })),
};

export default HtmlComponent;
