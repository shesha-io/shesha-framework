import { FilterOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { FC } from 'react';
import { IToolboxComponent } from '../../../interfaces';
import { useDataTableStore } from '../../../providers';
import { useForm } from '../../../providers/form';
import { FormMarkup, IConfigurableFormComponent } from '../../../providers/form/models';
import { validateConfigurableComponentSettings } from '../../../providers/form/utils';
import settingsFormJson from './settingsForm.json';

export interface IPagerComponentProps extends IConfigurableFormComponent {}

const settingsForm = settingsFormJson as FormMarkup;

const AdvancedFilterButtonComponent: IToolboxComponent<IPagerComponentProps> = {
  type: 'datatable.advancedFilterButton',
  name: 'Table Advanced Filter Button',
  icon: <FilterOutlined />,
  factory: (model: IPagerComponentProps) => {
    const { isComponentHidden } = useForm();

    if (isComponentHidden(model)) return null;

    return <AdvancedFilterButton {...model} />;
  },
  initModel: (model: IPagerComponentProps) => {
    return {
      ...model,
      items: [],
    };
  },
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  isHidden: true, // note: to be removed, now is used only for backward compatibility
};

export const AdvancedFilterButton: FC<IPagerComponentProps> = ({}) => {
  const {
    isInProgress: { isFiltering },
    setIsInProgressFlag,
  } = useDataTableStore();

  const startFilteringColumns = () => setIsInProgressFlag({ isFiltering: true, isSelectingColumns: false });

  return (
    <Button
      type="link"
      disabled={!!isFiltering}
      onClick={startFilteringColumns}
      className="extra-btn filter"
      icon={<FilterOutlined />}
      size="small"
    />
  );
};

export default AdvancedFilterButtonComponent;
