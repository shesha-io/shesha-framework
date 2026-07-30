import { Config, Fields, Utils as QbUtils } from '@react-awesome-query-builder/antd';

jest.mock('../../widgets/entityAutocomplete', () => ({ __esModule: true, default: {} }));
jest.mock('../../widgets/refListDropDown', () => ({ __esModule: true, default: {} }));
jest.mock('../../widgets/specification', () => ({ __esModule: true, SpecificationWidget: {} }));
jest.mock('../../widgets/javascript/index', () => ({ __esModule: true, JavaScriptWidget: {} }));
jest.mock('../../widgets/booleanButtonSelect', () => ({ __esModule: true, BooleanButtonSelectWidget: {} }));
jest.mock('../../widgets/field', () => {
  const { BasicConfig } = require('@react-awesome-query-builder/antd');
  return { __esModule: true, FieldWidget: { ...BasicConfig.widgets.field } };
});
jest.mock('../../widgets/ignoreIfUnassigned', () => ({ __esModule: true, IgnoreIfUnassignedWidget: {} }));
jest.mock('../../widgets/mustacheExpression', () => ({ __esModule: true, MustacheExpressionWidget: {} }));
// Mirrors the real `getEvaluateFunc` shape; the real module reaches into providers/ and pulls in
// `?raw` imports that jest cannot resolve.
jest.mock('../../funcs/evaluate', () => ({
  __esModule: true,
  getEvaluateFunc: (type: string) => ({
    label: `EVALUATE_${type}`,
    returnType: type,
    hideForSelect: true,
    args: {},
  }),
}));

const { config: queryBuilderConfig } = require('../../config');
const { getFieldOperators, getFuncCandidates, getOperatorCardinality } = require('../raqbConfig');

const createConfig = (): Config => {
  const fields: Fields = {
    textPrimary: { label: 'Text Primary', type: 'text' },
    numberPrimary: { label: 'Number Primary', type: 'number' },
  };

  return QbUtils.ConfigUtils.extendConfig({ ...queryBuilderConfig, fields } as Config);
};

describe('raqbConfig', () => {
  const config = createConfig();

  describe('getFuncCandidates', () => {
    it('offers the text-case functions for text fields', () => {
      const selectable = getFuncCandidates(config, 'text')
        .filter((candidate: { hidden: boolean }) => !candidate.hidden)
        .map((candidate: { label: string }) => candidate.label);

      expect(selectable).toEqual(expect.arrayContaining(['Uppercase', 'Lowercase']));
    });

    it('keeps the mustache evaluate function available but out of the dropdown', () => {
      const evaluateCandidate = getFuncCandidates(config, 'text')
        .find((candidate: { key: string }) => candidate.key.startsWith('EVALUATE_'));

      expect(evaluateCandidate).toBeDefined();
      expect(evaluateCandidate.hidden).toBe(true);
    });

    it('does not offer text-case functions for a numeric field', () => {
      const keys = getFuncCandidates(config, 'number').map((candidate: { key: string }) => candidate.key);

      expect(keys).not.toContain('UPPER');
      expect(keys).not.toContain('LOWER');
    });
  });

  describe('getOperatorCardinality', () => {
    it('reports two values for between', () => {
      expect(getOperatorCardinality(config, 'between', 'numberPrimary')).toBe(2);
    });

    it('reports no value for a unary operator', () => {
      expect(getOperatorCardinality(config, 'is_null', 'textPrimary')).toBe(0);
    });
  });

  describe('getFieldOperators', () => {
    it('resolves the operators configured for a text field', () => {
      expect(getFieldOperators(config, 'textPrimary')).toEqual(expect.arrayContaining(['equal', 'like']));
    });
  });
});
