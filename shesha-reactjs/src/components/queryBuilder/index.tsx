import React, { FC, useEffect, useMemo } from 'react';
import { config as InitialConfig } from './config';
import { DataTypes } from '@/interfaces/dataTypes';
import { extractVars } from '@/utils/jsonLogic';
import { hasCustomQBSettings, IProperty, propertyHasQBConfig, type CustomFieldSettings } from '@/providers/queryBuilder/models';
import { IQueryBuilderProps } from './interfaces';
import { QueryBuilderContent } from './queryBuilderContent';
import { Skeleton } from 'antd';
import { useQueryBuilder } from '@/providers';
import {
  Config,
  Fields,
  FieldOrGroup,
  Settings,
} from '@react-awesome-query-builder/antd';
import { isDefined } from '@/utils/nullables';

const normalizeTypeAlias = (value?: string): string => {
  return value?.replace(/[\s_-]/g, '').toLowerCase() ?? '';
};

const getTypeOverrideFromAlias = (
  typeShortAlias?: string,
): { type?: string; preferWidgets?: string[] } => {
  const alias = normalizeTypeAlias(typeShortAlias);
  switch (alias) {
    case 'text':
    case 'string':
      return { type: 'text' };
    case 'number':
      return { type: 'number' };
    case 'date':
      return { type: 'date' };
    case 'datetime':
      return { type: 'datetime' };
    case 'time':
      return { type: 'time' };
    case 'guid':
      return { type: 'guid' };
    case 'entityreference':
      return { type: 'entityReference' };
    case 'reflist':
    case 'referencelistitem':
      return { type: 'refList', preferWidgets: ['refListDropdown'] };
    default:
      return {};
  }
};

const QueryBuilder: FC<IQueryBuilderProps> = (props) => {
  const { value } = props;
  const { fields, fetchFields, customWidgets } = useQueryBuilder();

  const missingFields = useMemo<string[]>(() => {
    if (!isDefined(value))
      return [];
    const vars = extractVars(value);
    const result = vars.filter((v) => !fields.find((f) => f.propertyName === v));
    return result;
  }, [value, fields]);

  useEffect(() => {
    if (missingFields.length > 0) {
      fetchFields(missingFields);
    }
  }, [missingFields]);

  // pre-parse tree and extract all used fields
  // load all fields which are missing

  const qbSettings: Settings = {
    ...InitialConfig.settings,
    addRuleLabel: 'Add Rule',
    addGroupLabel: 'Add Group',
    addSubRuleLabel: 'Add Rule',
    addSubGroupLabel: 'Add Group',
    groupActionsPosition: 'bottomRight',
    fieldPlaceholder: 'Select field',
    operatorPlaceholder: 'Select operator',
    fieldLabel: 'Field',
    operatorLabel: 'Operator',
    showNot: false,
    removeIncompleteRulesOnLoad: false,
    removeEmptyGroupsOnLoad: false,
    removeEmptyRulesOnLoad: false,
    removeInvalidMultiSelectValuesOnLoad: false,
    fieldSources: ["field"],
  };

  const convertFields = (fields: IProperty[]): Fields => {
    const confFields: Fields = {};

    const convertField = (property: IProperty): FieldOrGroup => {
      if (propertyHasQBConfig(property))
        return property.convert(property);

      const { dataType, visible, label, fieldSettings, preferWidgets, childProperties: childProps } = property;
      let type: string = dataType;
      let defaultPreferWidgets: string[] | undefined = undefined;

      /*
      Fields can be of type:
        simple (string, number, bool, date/time/datetime, list)
        structs (will be displayed in selectbox as tree)
        custom type (dev should add its own widget component in config for this)
      */

      // Note: include namespaces and exclude arrays (they are not supported for now)
      const isVisible = (visible || dataType === 'namespace') && dataType !== DataTypes.array;
      if (!isVisible)
        return null;

      const typeOverride = getTypeOverrideFromAlias((fieldSettings as CustomFieldSettings | undefined)?.typeShortAlias);
      if (typeOverride.type) {
        type = typeOverride.type;
        defaultPreferWidgets = typeOverride.preferWidgets ?? [];
      } else {
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
            break;

          case 'refList':
          case DataTypes.referenceListItem:
            type = 'refList';
            defaultPreferWidgets = ['refListDropdown'];
            break;
          case '!struct':
            type = dataType;
            break;
          default:
            break;
        }
      }

      const fieldPreferWidgets = preferWidgets ?? defaultPreferWidgets ?? [];

      const subfields = dataType === '!struct' ? {} : undefined;
      if (subfields) {
        childProps.forEach((p) => {
          const converted = convertField(p);
          if (converted)
            subfields[p.propertyName] = converted;
        });
      }

      return {
        label,
        type,
        // @ts-ignore note: types are wrong in the library, they doesn't allow to extend
        fieldSettings,
        preferWidgets: fieldPreferWidgets.length > 0 ? fieldPreferWidgets : undefined,
        subfields: subfields,
      };
    };

    fields?.forEach((property) => {
      const converted = hasCustomQBSettings(property)
        ? property.toQueryBuilderField(() => convertField(property))
        : convertField(property);

      if (converted)
        confFields[property.propertyName] = converted;
    });
    return confFields;
  };

  const qbConfig = useMemo(() => {
    const conf: Config = {
      ...InitialConfig,
      widgets: { ...InitialConfig.widgets, ...customWidgets },
      settings: qbSettings,
      conjunctions: {
        ...InitialConfig.conjunctions,
        AND: {
          ...InitialConfig.conjunctions.AND,
          label: 'And',
        },
        OR: {
          ...InitialConfig.conjunctions.OR,
          label: 'Or',
        },
      },
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
  }, [fields, customWidgets, props.readOnly]);

  return missingFields.length > 0 ? <Skeleton></Skeleton> : <QueryBuilderContent {...props} qbConfig={qbConfig} />;
};

export { QueryBuilder, type IQueryBuilderProps };
