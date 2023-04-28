import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { OrderedListOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm, useFormItem } from '../../../../providers';
import { listSettingsForm } from './settings';
import ConfigurableFormItem from '../formItem';
import './styles/index.less';
import { ListControlSettings } from './settingsv2';
import { IListComponentProps, IListItemsProps } from './models';
import { nanoid } from 'nanoid';
import ListControl from './listControl';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import classNames from 'classnames';
import { DEFAULT_CONFIRM_MESSAGE } from './constants';

/** @deprecated: Use DataListComponent instead */
const ListComponent: IToolboxComponent<IListComponentProps> = {
  type: 'list',
  name: 'List',
  icon: <OrderedListOutlined />,
  isHidden: true, /* Use DataList instead */
  factory: ({ ...model }: IListComponentProps) => {
    const { isComponentHidden, formMode } = useForm();

    const isHidden = isComponentHidden(model);

    const { namePrefix } = useFormItem();

    if (isHidden) return null;

    return (
      <ConfigurableFormItem
        model={{ ...model }}
        className={classNames(
          'sha-list-component',
          { horizontal: model?.orientation === 'horizontal' && formMode !== 'designer' } //
        )}
        labelCol={{ span: model?.hideLabel ? 0 : model?.labelCol }}
        wrapperCol={{ span: model?.hideLabel ? 24 : model?.wrapperCol }}
      >
        <ListControl {...model} containerId={model?.id} namePrefix={namePrefix || ''} />
      </ConfigurableFormItem>
    );
  },
  // settingsFormMarkup: listSettingsForm,
  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <ListControlSettings
        readOnly={readOnly}
        model={(model as unknown) as IListItemsProps}
        onSave={onSave as any}
        onCancel={onCancel}
        onValuesChange={onValuesChange as any}
      />
    );
  },
  migrator: m =>
    m
      .add<IListComponentProps>(0, prev => {
        const uniqueStateId = `FORM_LIST_${nanoid()}`;

        const customProps: IListComponentProps = {
          ...prev,
          showPagination: prev['showPagination'] ?? true,
          hideLabel: prev['hideLabel'] ?? true,
          uniqueStateId: prev['uniqueStateId'] ?? uniqueStateId,
          submitHttpVerb: 'POST',
          labelCol: prev['labelCol'] ?? 5,
          wrapperCol: prev['wrapperCol'] ?? 13,
          selectionMode: prev['selectionMode'] ?? 'none',
          deleteConfirmMessage: prev['deleteConfirmMessage'] ?? `return ${DEFAULT_CONFIRM_MESSAGE}`,
          totalRecords: 100,
          buttons: prev['buttons'] ?? [
            {
              id: nanoid(),
              itemType: 'item',
              sortOrder: 0,
              name: 'button1',
              label: ' ',
              itemSubType: 'button',
              uniqueStateId,
              buttonAction: 'dispatchAnEvent',
              eventName: 'refreshListItems',
              chosen: false,
              selected: false,
              icon: 'ReloadOutlined',
              buttonType: 'link',
            },
          ],
          paginationDefaultPageSize: 10,
        };
        return customProps;
      })
      .add<IListComponentProps>(1, migrateV0toV1)
      .add<IListComponentProps>(2, migrateV1toV2),
  validateSettings: model => validateConfigurableComponentSettings(listSettingsForm, model),
};

export default ListComponent;
