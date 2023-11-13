import React, { FC, useState } from 'react';
import { SidebarContainer, ConfigurableFormRenderer, CollapsiblePanel } from '../../components';
import { Col, Divider, Typography, Space } from 'antd';
import Toolbox from './toolbox';
import FormDesignerToolbar from './formDesignerToolbar';
import ComponentPropertiesPanel from './componentPropertiesPanel';
import ComponentPropertiesTitle from './componentPropertiesTitle';
import { useForm } from '../../providers/form';
import { MetadataProvider } from '../../providers';
import ConditionalWrap from '../conditionalWrapper';
import { useFormPersister } from '../../providers/formPersisterProvider';
import { useFormDesigner } from '../../providers/formDesigner';
import StatusTag from '../statusTag';
import { CONFIGURATION_ITEM_STATUS_MAPPING } from '../../utils/configurationFramework/models';
import { getFormFullName } from '../../utils/form';
import HelpTextPopover from '../helpTextPopover';
import { useDataContextManager } from 'providers/dataContextManager';

const { Title } = Typography;

export const FormDesignerRenderer: FC = ({ }) => {
  const [widgetsOpen, setWidgetOpen] = useState(true);
  const [fieldPropertiesOpen, setFieldPropertiesOpen] = useState(true);
  const { formProps } = useFormPersister();

  const toggleWidgetSidebar = () => setWidgetOpen((widget) => !widget);

  const toggleFieldPropertiesSidebar = () => setFieldPropertiesOpen((prop) => !prop);

  const { isDebug, readOnly } = useFormDesigner();
  const formInstance = useForm();
  const { formSettings, form } = formInstance;
  //const contextManager = useDataContextManager(false);
  //if (contextManager)
  //contextManager.updateFormInstance(formInstance);

  const fullName = formProps ? getFormFullName(formProps.module, formProps.name) : null;
  const title = formProps?.label ? `${formProps.label} (${fullName})` : fullName;

  return (
    <div className="sha-page">
      <div className="sha-page-heading">
        <div className="sha-page-title" style={{ justifyContent: 'left' }}>
          <Space>
            {title && (
              <Title level={4} style={{ margin: 'unset' }}>
                {title} v{formProps.versionNo}
              </Title>
            )}
            <HelpTextPopover content={formProps.description}></HelpTextPopover>
            <StatusTag value={formProps.versionStatus} mappings={CONFIGURATION_ITEM_STATUS_MAPPING} color={null}></StatusTag>
          </Space>
        </div>
      </div>
      <div className="sha-form-designer">
        <ConditionalWrap
          condition={Boolean(formSettings.modelType)}
          wrap={(content) => (
            <MetadataProvider id="designer" modelType={formSettings.modelType}>
              {content}
            </MetadataProvider>
          )}
        >
          <FormDesignerToolbar />
          <SidebarContainer
            leftSidebarProps={
              readOnly
                ? null
                : {
                  open: widgetsOpen,
                  onOpen: toggleWidgetSidebar,
                  onClose: toggleWidgetSidebar,
                  title: 'Builder Widgets',
                  content: () => <Toolbox />,
                  placeholder: 'Builder Widgets',
                }
            }
            rightSidebarProps={{
              open: fieldPropertiesOpen,
              onOpen: toggleFieldPropertiesSidebar,
              onClose: toggleFieldPropertiesSidebar,
              title: () => <ComponentPropertiesTitle />,
              content: () => <ComponentPropertiesPanel />,
              placeholder: 'Properties',
            }}
          >
            <ConfigurableFormRenderer form={form} skipFetchData={true}>
              {isDebug && (
                <DebugPanel formData={form.getFieldsValue()} />
              )}
            </ConfigurableFormRenderer>
          </SidebarContainer>
        </ConditionalWrap>
      </div>
    </div>
  );
};

interface DebugPanelProps {
  formData?: any;
}

const DebugPanel: FC<DebugPanelProps> = (props) => {

  const ctxManager = useDataContextManager(false);

  const contexts = ctxManager.getDataContexts('all');

  return (
    <>
      <Divider />
      <CollapsiblePanel header='Form data' expandIconPosition='start' ghost>
        <Col span={24}>
          <pre>{JSON.stringify(props.formData, null, 2)}</pre>
        </Col>
      </CollapsiblePanel>
      {contexts.map((ctx) =>
        <CollapsiblePanel header={<>{ctx.name}: {ctx.description} <span style={{ color: 'gray' }}>({ctx.id})</span></>} expandIconPosition='start' ghost>
          <Col span={24}>
            <pre>{JSON.stringify(ctx.getData(), null, 2)}</pre>
          </Col>
        </CollapsiblePanel>
      )}
    </>
  );
};