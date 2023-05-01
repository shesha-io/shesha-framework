import React, { FC, useEffect, useMemo } from 'react';
import {
  Query,
  Builder,
  Utils as QbUtils,
  ImmutableTree,
  Config,
  BuilderProps,
  JsonLogicResult,
  FieldSettings,
  Widgets,
  Fields,
} from '@react-awesome-query-builder/antd';
import classNames from 'classnames';
import { ITableColumn } from '../../interfaces';
import { IProperty } from '../../providers/queryBuilder/models';
import { DataTypes } from '../../interfaces/dataTypes';
import { config as InitialConfig } from './config';
import { FieldSelect } from './fieldSelect';
import { FieldAutocomplete } from './fieldAutocomplete';
import { extractVars } from '../../utils/jsonLogic';
import { Skeleton } from 'antd';

export interface IQueryBuilderColumn extends ITableColumn {
  fieldSettings?: FieldSettings;
  preferWidgets?: Widgets[];
}

export interface IQueryFieldsSource {
  requireFields: (fields: string[]) => Promise<IProperty[]>;
  fields: IProperty[];
}

export interface IQueryBuilderProps {
  value?: object;
  onChange?: (result: JsonLogicResult) => void;
  columns?: IQueryBuilderColumn[];
  fields: IProperty[];
  fetchFields: (fieldNames: string[]) => void;
  showActionBtnOnHover?: boolean;
  readOnly?: boolean;
}

export const QueryBuilder: FC<IQueryBuilderProps> = props => {
  const { value, fields, fetchFields } = props;

  const missingFields = useMemo(() => {
    const vars = extractVars(value);
    const result = vars.filter(v => !fields.find(f => f.propertyName === v));
    return result;
  }, [value, fields]);

  useEffect(() => {
    if (missingFields.length > 0) {
      fetchFields(missingFields);
    }
  }, [missingFields]);

  // pre-parse tree and extract all used fields
  // load all fields which are missing

  const qbSettings = {
    ...InitialConfig.settings,
    renderField: props => (true ? <FieldAutocomplete {...props} /> : <FieldSelect {...props} />),
  };

  const convertFields = (fields: IProperty[]): Fields => {
    const confFields: Fields = {};

    fields?.forEach(({ dataType, visible, propertyName, label, fieldSettings, preferWidgets }) => {
      let type: string = dataType;
      let defaultPreferWidgets = [];

      /*
      Fields can be of type:
        simple (string, number, bool, date/time/datetime, list)
        structs (will be displayed in selectbox as tree)
        custom type (dev should add its own widget component in config for this)
      */

      // Note: include namespaces and exclude arrays (they are not supported for now)
      const isVisible = (visible || dataType === 'namespace') && dataType !== DataTypes.array;
      if (isVisible) {
        switch (dataType) {
          case 'string':
          case DataTypes.string:
            type = 'text';
            break;

          case DataTypes.date:
            type = 'date';
            break;
          case DataTypes.dateTime:
            type = 'datetime';
            break;
          case DataTypes.time:
            type = 'time';
            break;

          case DataTypes.number:
            type = 'number';
            break;

          case 'entityReference':
          case DataTypes.entityReference:
            type = 'entityReference';
            //defaultPreferWidgets = ['entityAutocomplete'];
            break;

          case 'refList':
          case DataTypes.referenceListItem:
            type = 'refList';
            defaultPreferWidgets = ['refListDropdown'];
            break;
          // case 'multiValueRefList':
          //   type = 'multiselect';
          //   break;
          case '!struct':
            type = dataType;
            break;
          default:
            break;
        }

        const fieldPreferWidgets = preferWidgets || defaultPreferWidgets || [];
        confFields[propertyName] = {
          label,
          type,
          // @ts-ignore note: types are wrong in the library, they doesn't allow to extend
          fieldSettings,
          preferWidgets: fieldPreferWidgets.length > 0 ? fieldPreferWidgets : undefined,
        };
      }
    });
    return confFields;
  };

  const qbConfig = useMemo(() => {
    const conf: Config = {
      ...InitialConfig,
      settings: qbSettings,
      fields: convertFields(fields),
    };
    if (props.readOnly) {
      conf.settings.immutableGroupsMode = true;
      conf.settings.immutableFieldsMode = true;
      conf.settings.immutableOpsMode = true;
      conf.settings.immutableValuesMode = true;
      conf.settings.canReorder = false;
      conf.settings.canRegroup = false;
    }

    return conf;
  }, [fields, props.readOnly]);

  return missingFields.length > 0 ? <Skeleton></Skeleton> : <QueryBuilderContent {...props} qbConfig={qbConfig} />;
};

interface IQueryBuilderContentProps extends IQueryBuilderProps {
  qbConfig: Config;
}

const loadJsonLogic = (jlValue: object, config: Config) => {
  try {
    const result = QbUtils.loadFromJsonLogic(jlValue, config);
    //console.log('JsonLogic converted:', result);
    return result;
  } catch (error) {
    console.error('failed to parse JsonLogic expression', { error, jlValue, config });
    return null;
  }
};

const QueryBuilderContent: FC<IQueryBuilderContentProps> = ({
  showActionBtnOnHover = true,
  onChange,
  value,
  qbConfig,
}) => {
  const tree = useMemo(() => {
    const loadedTree = value
      ? loadJsonLogic(value, qbConfig) // QbUtils.loadFromJsonLogic(value, qbConfig)
      : QbUtils.loadTree({ id: QbUtils.uuid(), type: 'group' });

    const checkedTree = QbUtils.checkTree(loadedTree, qbConfig);
    return checkedTree;
  }, [value]);

  const renderBuilder = (props: BuilderProps) => {
    return (
      <div className="query-builder-container">
        <div className={classNames('query-builder', { 'qb-lite': showActionBtnOnHover })}>
          <Builder {...props} />
        </div>
      </div>
    );
  };

  const handleChange = (_tree: ImmutableTree, _config: Config) => {
    if (onChange) {
      onChange(QbUtils.jsonLogicFormat(_tree, _config));
    }
  };

  return (
    <div className="sha-query-builder">
      {tree && qbConfig && <Query {...qbConfig} value={tree} onChange={handleChange} renderBuilder={renderBuilder} />}
    </div>
  );
};

export default QueryBuilder;
