import { DatabaseOutlined } from '@ant-design/icons';

import { TableContext } from './tableContext';
import { ITableContextComponentProps, TableContextComponentDefinition } from './models';
import { getSettings } from './settingsForm';
import { isEntityTypeIdEmpty } from '@/providers/metadataDispatcher/entities/utils';
import { isNullOrWhiteSpace } from '@/utils';
import { migratePermissionsToVisiblePermissions } from '@/designer-components/_common-migrations/migratePermissionsToVisiblePermissions';
import { migrateHiddenToVisible } from '@/designer-components/_common-migrations';

/**
 * Data Context component (dataContext)
 * This is the new clean implementation of the data context component.
 * Legacy datatableContext components will be automatically migrated to this type.
 */
const TableContextComponent: TableContextComponentDefinition = {
  allowInherit: true,
  type: 'dataContext',
  isInput: true,
  isOutput: true,
  name: 'Data Context',
  icon: <DatabaseOutlined />,
  Factory: ({ model, form }) => {
    // useComponentApi<DataContextApi>({ model, typeName: 'DataContextApi' }); // ToDo: AS - check if DataContext should have its own api
    return model.hidden === true ? null : <TableContext {...model} formMode={form.formMode} />;
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
      visible: model.visible ?? true,
    } : model;

    return initialModel;
  },
  // reorder actions carry templates that only resolve when the event fires
  actualModelPropertyFilter: (name) => !['permanentFilter', 'onBeforeRowReorder', 'onAfterRowReorder'].includes(name),
  settingsFormMarkup: (data) => getSettings(data),

  getFieldsToFetch: (propertyName, rawModel) => {
    return rawModel.sourceType === 'Form' ? [propertyName] : [];
  },
  validateModel: (model, addModelError) => {
    if (!model.sourceType) addModelError('sourceType', 'Select `Source type` on the settings panel');
    if (model.sourceType === 'Entity' && isEntityTypeIdEmpty(model.entityType)) addModelError('entityType', 'Select `Entity Type` on the settings panel');
    if (model.sourceType === 'Url' && isNullOrWhiteSpace(model.endpoint)) addModelError('endpoint', 'Select `Custom Endpoint` on the settings panel');
    if (model.sourceType === 'Form' && isNullOrWhiteSpace(model.propertyName)) addModelError('propertyName', 'Select `propertyName` on the settings panel');
  },
  migrator: (m) => m
    .add<ITableContextComponentProps>(5, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(prev))),
};

export default TableContextComponent;
