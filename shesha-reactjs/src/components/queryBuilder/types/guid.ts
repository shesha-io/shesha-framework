import { Type, BasicConfig, AntdConfig } from '@react-awesome-query-builder/antd';

const standardTypes = AntdConfig.types ?? BasicConfig.types;

export type CustomType = Type & {
  operators?: string[];
};

export const GuidType: CustomType = {
  ...standardTypes.text,
  valueSources: ['value', 'field', 'func'],
  defaultOperator: 'equal',
  operators: [
    'equal',
    'not_equal',
    'is_empty',
    'is_not_empty',
  ],
};


// TODO: implement guid widget and use validation
// export const validateGuidField: ValidateValue<string> = (val: string/*, fieldSettings: FieldSettings, op: string, opDef: Operator, rightFieldDef?: Field*/): boolean | string | null => {
//   var pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
//   if (!val)
//     return 'Please specify a valid guid value';

//   const matches = val.match(pattern);

//   return Boolean(matches)
//     ? true
//     : 'Invalid guid value';
// };

export default GuidType;
