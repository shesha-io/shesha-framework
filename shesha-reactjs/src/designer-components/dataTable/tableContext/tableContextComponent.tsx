import React from 'react';
import { DatabaseOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { TableContext } from './tableContext';
import { TableContextComponentDefinition } from './models';
import { getSettings } from './settingsForm';
import { isEntityTypeIdEmpty } from '@/providers/metadataDispatcher/entities/utils';

/**
 * Data Context component (dataContext)
 * This is the new clean implementation of the data context component.
 * Legacy datatableContext components will be automatically migrated to this type.
 */
const TableContextComponent: TableContextComponentDefinition = {
  type: 'dataContext',
  isInput: true,
  isOutput: true,
  name: 'Data Context',
  icon: <DatabaseOutlined />,
  Factory: ({ model }) => {
    return model.hidden ? null : <TableContext {...model} />;
  },
  initModel: (model) => {
    // Set defaults for new components (when dragging from toolbox)
    const isNewComponent = !model.sourceType && isEntityTypeIdEmpty(model.entityType);

    const initialModel = isNewComponent ? {
      ...model,
      sourceType: 'Entity' as const,
      entityType: 'Shesha.Core.DummyTable',
      dataFetchingMode: 'paging' as const,
      defaultPageSize: 10,
      sortMode: 'standard' as const,
      strictSortOrder: 'asc' as const,
      allowReordering: 'no' as const,
    } : model;

    return initialModel;
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  getFieldsToFetch: (propertyName, rawModel) => {
    return rawModel.sourceType === 'Form' ? [propertyName] : [];
  },
  validateModel: (model, addModelError) => {
    if (!model.sourceType) addModelError('sourceType', 'Select `Source type` on the settings panel');
    if (model.sourceType === 'Entity' && isEntityTypeIdEmpty(model.entityType)) addModelError('entityType', 'Select `Entity Type` on the settings panel');
    if (model.sourceType === 'Url' && !model.endpoint) addModelError('endpoint', 'Select `Custom Endpoint` on the settings panel');
    if (model.sourceType === 'Form' && !model.propertyName) addModelError('propertyName', 'Select `propertyName` on the settings panel');
  },
};

export default TableContextComponent;
