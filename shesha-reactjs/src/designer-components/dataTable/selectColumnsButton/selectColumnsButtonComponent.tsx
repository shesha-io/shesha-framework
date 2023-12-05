import { SlidersOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { FC } from 'react';
import { IToolboxComponent } from '@/interfaces';
import { useDataTableStore } from '@/providers';
import { FormMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import settingsFormJson from './settingsForm.json';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';

export interface IPagerComponentProps extends IConfigurableFormComponent {}

const settingsForm = settingsFormJson as FormMarkup;

const SelectColumnsButtonComponent: IToolboxComponent<IPagerComponentProps> = {
  type: 'datatable.selectColumnsButton',
  name: 'Table Select Columns Button',
  icon: <SlidersOutlined />,
  Factory: ({ model }) => {
    return <SelectColumnsButton {...model} />;
  },
  initModel: (model: IPagerComponentProps) => {
    return {
      ...model,
      items: [],
    };
  },
  migrator: m => m
    .add(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IPagerComponentProps>(1, (prev) => migrateVisibility(prev))    
,
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  isHidden: true, // note: to be removed, now is used only for backward compatibility
};

export const SelectColumnsButton: FC<IPagerComponentProps> = ({}) => {
  const {
    isInProgress: { isSelectingColumns },
    setIsInProgressFlag,
  } = useDataTableStore();

  const startTogglingColumnVisibility = () => setIsInProgressFlag({ isSelectingColumns: true, isFiltering: false });

  return (
    <Button
      type="link"
      className="extra-btn column-visibility"
      icon={<SlidersOutlined rotate={90} />}
      disabled={!!isSelectingColumns}
      onClick={startTogglingColumnVisibility}
      size="small"
    />
  );
};

export default SelectColumnsButtonComponent;
