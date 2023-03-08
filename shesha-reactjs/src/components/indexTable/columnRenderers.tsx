import React from 'react';
import moment from 'moment';
import { ITableCustomTypesRender } from './interfaces';
import { IConfigurableActionColumnsProps } from '../../providers/datatableColumnsConfigurator/models';
import ShaIcon, { IconType } from '../shaIcon';
import { useDataTable, useForm, useGlobalState, useMetadata, useSheshaApplication } from '../../providers';
import { message } from 'antd';
import { axiosHttp } from '../../apis/axios';
import { useReferenceListItem } from '../../providers/referenceListDispatcher';
import { useConfigurableActionDispatcher } from '../../providers/configurableActionsDispatcher';
import { getNumberFormat, toCamelCase } from '../../utils/string';
import { MODAL_DATA } from '../../constants';

export const renderers: ITableCustomTypesRender[] = [
  {
    key: 'string',
    render: props => {
      return props.value;
    },
  },
  {
    key: 'number',
    render: props => {
      const metadata = useMetadata(false)?.metadata;

      const format = metadata?.properties?.find(({ path }) => toCamelCase(path) === props?.column?.id)?.dataFormat;

      return getNumberFormat(props.value, format);
    },
  },
  {
    key: 'date',
    render: props => {
      const metadata = useMetadata(false)?.metadata;

      const dataFormat = metadata?.properties?.find(({ path }) => toCamelCase(path) === props?.column?.id)?.dataFormat;

      return props.value ? moment(props.value).format(dataFormat || 'DD/MM/YYYY') : null;
    },
  },
  {
    key: 'date-time',
    render: props => {
      const metadata = useMetadata(false)?.metadata;

      const dataFormat = metadata?.properties?.find(({ path }) => toCamelCase(path) === props?.column?.id)?.dataFormat;

      return props.value ? moment(props.value).format(dataFormat || 'DD/MM/YYYY HH:mm') : null;
    },
  },
  {
    key: 'time',
    render: props => {
      const metadata = useMetadata(false)?.metadata;

      const dataFormat = metadata?.properties?.find(({ path }) => toCamelCase(path) === props?.column?.id)?.dataFormat;

      return props.value ? moment.utc(props.value * 1000).format(dataFormat || 'HH:mm') : null;
    },
  },
  {
    key: 'boolean',
    render: props => {
      return props.value ? 'Yes' : 'No';
    },
  },
  {
    key: 'duration',
    render: props => {
      const time = props.value ? moment(props.value, 'HH:mm:ss') : null;
      return time && time.isValid ? time.format('HH:mm:ss') : null;
    },
  },
  {
    key: 'reference-list-item',
    render: props => {
      const {
        column: { referenceListName, referenceListModule },
        value: colValue,
      } = props;
      //console.log('reference-list-item', referenceListModule, referenceListName);
      const item = useReferenceListItem(referenceListModule, referenceListName, colValue);
      return item?.data?.item;
    },
  },
  {
    key: 'entity',
    render: props => {
      return typeof props?.value === 'object'
        ? props?.value?.displayText ?? props?.value?._displayName
        : props?.value ?? null;
    },
  },
  {
    key: 'action',
    render: props => {
      const { changeActionedRow } = useDataTable();
      const { backendUrl } = useSheshaApplication();
      const { formData, formMode } = useForm();
      const { globalState, setState } = useGlobalState();

      const { executeAction } = useConfigurableActionDispatcher();

      const getActionProps = (data): IConfigurableActionColumnsProps => {
        return data?.column?.actionProps as IConfigurableActionColumnsProps;
      };

      const getRowData = data => {
        return data?.cell?.row?.original;
      };

      const clickHandler = (event, data) => {
        event.stopPropagation();

        const actionProps = getActionProps(data);

        const selectedRow = getRowData(data);

        if (!actionProps) return;

        setState({ data: selectedRow, key: MODAL_DATA });
        changeActionedRow(data.row.original);

        if (actionProps.actionConfiguration) {
          // todo: implement generic context collector
          const evaluationContext = {
            selectedRow: selectedRow,
            data: formData,
            moment: moment,
            formMode: formMode,
            http: axiosHttp(backendUrl),
            message: message,
            globalState: globalState,
          };

          executeAction({
            actionConfiguration: actionProps.actionConfiguration,
            argumentsEvaluationContext: evaluationContext,
          });
        } else console.error('Action is not configured');
      };

      const aProps = getActionProps(props);
      return (
        <a className="sha-link" onClick={e => clickHandler(e, props)}>
          {aProps.icon && <ShaIcon iconName={aProps.icon as IconType} />}
        </a>
      );
    },
  },
];
