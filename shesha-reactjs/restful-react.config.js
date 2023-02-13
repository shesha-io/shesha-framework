// eslint-disable-next-line import/no-extraneous-dependencies
const camelcase = require('camelcase');

const STORYBOOK_BASE_URL = 'http://localhost:21021';
// const STORYBOOK_BASE_URL = process.env.STORYBOOK_BASE_URL;
const ROOT_PATH = './src/apis';

const API_LIST = [
  //'FormConfiguration'
  //'Form',
  //'DataTable',
  //'PermissionedObject'
  /*
  //'Applications',
  'Area',
  'AuthorizationSettings',
  'Autocomplete',
  'CheckList',
  'CheckListItem',
  'ConfigurableComponent',
  'Note',
  'Person',
  'ReferenceList',
  'ScheduledJobExecution',
  'Session',
  'StoredFile',
  'TokenAuth',
  'User',
  'Metadata',
  */
 'Metadata'
  //'EntityConfig',
  // 'EntityProperty',
  //'ModelConfigurations',
  // 'PersonTest',
  // 'ImportResult',
  // 'Module',
  // 'NHibernate',
  // 'Form',
  // 'ConfigurationItem',
  //'Entities',
];

const defaultConfiguration = {
  customImport: 'import * as RestfulShesha from "../utils/fetchers"',
  customGenerator: ({ componentName, verb, route, description, genericsTypes, paramsInPath, paramsTypes }) => {
    const propsType = type =>
      `RestfulShesha.${type}Props<${genericsTypes}>${paramsInPath.length ? ` & {${paramsTypes}}` : ''}`;

    const funcName = camelcase(componentName);
    const innerCallParamTypes = propsType(verb === 'get' ? 'Get' : 'Mutate');

    const propTypesName = `${funcName}Props`;

    const genericTypesArray = (genericsTypes || '')
      .toString()
      .split(',')
      .map(p => p.trim());
    if (verb === 'get') {
      const propsTypeDeclaration = `export type ${propTypesName} = Omit<
    ${innerCallParamTypes},
    'queryParams'
  >;`;
      const qsType = genericTypesArray.length >= 3 ? genericTypesArray[2] : null;
      const hasQs = qsType !== 'void';
      const qsParam = hasQs ? `queryParams: ${qsType},` : '';

      return `${propsTypeDeclaration}
        ${description}export const ${funcName} = (${qsParam}
          ${
            paramsInPath.length ? `{${paramsInPath.join(', ')}, ...props}` : 'props'
          }: ${propTypesName}) => RestfulShesha.get<${genericsTypes}>(\`${route}\`, ${
        hasQs ? 'queryParams' : 'undefined'
      }, props);\n\n`;
    }
    const propsTypeDeclaration = `export type ${propTypesName} = Omit<
    ${innerCallParamTypes},
    'data'
  >;`;
    const dataType = genericTypesArray.length >= 4 ? genericTypesArray[3] : null;
    dataType;
    const hasData = dataType !== 'void';
    const dataParam = hasData ? `data: ${dataType},` : '';

    return `${propsTypeDeclaration}
      ${description}export const ${funcName} = (${dataParam}${
      paramsInPath.length ? `{${paramsInPath.join(', ')}, ...props}` : 'props'
    }: ${propTypesName}) => RestfulShesha.mutate<${genericsTypes}>("${verb.toUpperCase()}", \`${route}\`, ${
      hasData ? 'data' : 'undefined'
    }, props);\n\n`;
  },
};

function generateFetcher() {
  const apiObj = {};

  API_LIST.forEach(key => {
    const camelCasedName = camelcase(key);

    apiObj[`${camelCasedName}Api`] = {
      ...defaultConfiguration,
      output: `${ROOT_PATH}/${camelCasedName}.tsx`,
      url: `${STORYBOOK_BASE_URL}/swagger/service:${key}/swagger.json`,
    };
  });

  return apiObj;
}

module.exports = {
  ...generateFetcher(),
};
