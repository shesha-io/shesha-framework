import { Config, Fields, Utils as QbUtils } from '@react-awesome-query-builder/antd';

jest.mock('../widgets/entityAutocomplete', () => ({ __esModule: true, default: {} }));
jest.mock('../widgets/refListDropDown', () => ({ __esModule: true, default: {} }));
jest.mock('../widgets/specification', () => ({ __esModule: true, SpecificationWidget: {} }));
jest.mock('../widgets/javascript/index', () => ({ __esModule: true, JavaScriptWidget: {} }));
jest.mock('../widgets/booleanButtonSelect', () => ({ __esModule: true, BooleanButtonSelectWidget: {} }));
jest.mock('../widgets/field', () => {
  const { BasicConfig } = require('@react-awesome-query-builder/antd');
  return { __esModule: true, FieldWidget: { ...BasicConfig.widgets.field } };
});
jest.mock('../widgets/ignoreIfUnassigned', () => ({ __esModule: true, IgnoreIfUnassignedWidget: {} }));
jest.mock('../widgets/mustacheExpression', () => ({ __esModule: true, MustacheExpressionWidget: {} }));
jest.mock('../funcs/evaluate', () => ({
  __esModule: true,
  getEvaluateFunc: (type: string) => ({
    label: `EVALUATE_${type}`,
    returnType: type,
    hideForSelect: true,
    args: {},
  }),
}));

const { config: queryBuilderConfig } = require('../config');

const allowedValueSources = ['value', 'field', 'func'];

interface CityRecord {
  id: string;
  area: number;
  city: string;
  country: string;
  funFact: string;
  population: number;
}

const citySeeds = [
  { city: 'Tokyo', country: 'Japan', fact: 'World transit density hub' },
  { city: 'Cape Town', country: 'South Africa', fact: 'Mountain and ocean in one skyline' },
  { city: 'Reykjavik', country: 'Iceland', fact: 'Geothermal capital with arctic light' },
  { city: 'Mexico City', country: 'Mexico', fact: 'High-altitude metropolis with deep history' },
  { city: 'Sao Paulo', country: 'Brazil', fact: 'Largest city economy in South America' },
  { city: 'Nairobi', country: 'Kenya', fact: 'Only capital with a safari park nearby' },
  { city: 'Vancouver', country: 'Canada', fact: 'Coastal mountain gateway for the Pacific' },
  { city: 'Melbourne', country: 'Australia', fact: 'Known for lanes coffee and sport culture' },
  { city: 'Mumbai', country: 'India', fact: 'Financial engine with major port activity' },
  { city: 'Zurich', country: 'Switzerland', fact: 'Banking center by a glacial lake' },
];

const createCityDataset = (count: number): CityRecord[] => {
  return Array.from({ length: count }, (_, index) => {
    const seed = citySeeds[index % citySeeds.length];
    const district = index % 5 === 0
      ? 'Central'
      : index % 5 === 1
        ? 'North'
        : index % 5 === 2
          ? 'South'
          : index % 5 === 3
            ? 'West'
            : 'East';
    const cityCore = index % 11 === 0 ? `${seed.city} Bay` : `${seed.city} ${district}`;
    const citySuffix = index % 4 === 0 ? '' : ` Sector-${index % 4}`;
    const city = `${cityCore}${citySuffix}`;
    const country = index % 9 === 0 ? `New ${seed.country}` : seed.country;
    const terrain = index % 2 === 0 ? 'coastal' : 'inland';
    const climate = index % 3 === 0 ? 'humid' : index % 3 === 1 ? 'temperate' : 'dry';
    const factPrefix = index % 4 === 0 ? 'A-class city profile' : 'B-class city profile';
    const funFact = `${factPrefix}; ${seed.fact}; ${terrain}; ${climate}; group-${index % 7}`;

    return {
      id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
      area: 180 + ((index * 173) % 3400),
      city,
      country,
      funFact,
      population: Number((0.15 + ((index * 37) % 460) / 10).toFixed(2)),
    };
  });
};

const runJsonLogicFilter = <T extends object>(query: object, rows: T[]): T[] => {
  return rows.filter((row) => Boolean(QbUtils.ConfigUtils.applyJsonLogic(query, row)));
};

const createConfig = (): Config => {
  const fields: Fields = {
    textPrimary: { label: 'Text Primary', type: 'text' },
    textSecondary: { label: 'Text Secondary', type: 'text' },
    numberPrimary: { label: 'Number Primary', type: 'number' },
    numberSecondary: { label: 'Number Secondary', type: 'number' },
    boolPrimary: { label: 'Boolean Primary', type: 'boolean' },
    boolSecondary: { label: 'Boolean Secondary', type: 'boolean' },
    datePrimary: { label: 'Date Primary', type: 'date' },
    dateSecondary: { label: 'Date Secondary', type: 'date' },
    datetimePrimary: { label: 'DateTime Primary', type: 'datetime' },
    datetimeSecondary: { label: 'DateTime Secondary', type: 'datetime' },
    timePrimary: { label: 'Time Primary', type: 'time' },
    timeSecondary: { label: 'Time Secondary', type: 'time' },
    guidPrimary: { label: 'Guid Primary', type: 'guid' },
    guidSecondary: { label: 'Guid Secondary', type: 'guid' },
    entityRefPrimary: { label: 'Entity Ref Primary', type: 'entityReference' },
    entityRefSecondary: { label: 'Entity Ref Secondary', type: 'entityReference' },
    refListPrimary: { label: 'RefList Primary', type: 'refList' },
    refListSecondary: { label: 'RefList Secondary', type: 'refList' },
  };

  return QbUtils.ConfigUtils.extendConfig({
    ...queryBuilderConfig,
    fields,
  });
};

const getValueSources = (config: Config, field: string, operator: string): string[] => {
  const fieldDefinition = QbUtils.ConfigUtils.getFieldConfig(config, field);
  return QbUtils.ConfigUtils.getValueSourcesForFieldOp(config, field, operator, fieldDefinition);
};

describe('QueryBuilder config matrix', () => {
  const config = createConfig();
  const fieldsToTest = [
    'textPrimary',
    'numberPrimary',
    'boolPrimary',
    'datePrimary',
    'datetimePrimary',
    'timePrimary',
    'guidPrimary',
    'entityRefPrimary',
    'refListPrimary',
  ];

  const combinations = fieldsToTest.flatMap((field) => {
    const operators = QbUtils.ConfigUtils.getOperatorsForField(config, field) ?? [];
    return operators.map((operator) => ({ field, operator }));
  });

  it.each(combinations)('supports source/widget combinations for $field + $operator', ({ field, operator }) => {
    const valueSources = getValueSources(config, field, operator);
    expect(valueSources.length).toBeGreaterThan(0);
    valueSources.forEach((source) => {
      expect(allowedValueSources).toContain(source);
      const widgets = QbUtils.ConfigUtils.getWidgetsForFieldOp(config, field, operator, source);
      expect(widgets.length).toBeGreaterThan(0);
    });
  });

  it('contains uses the same value-source options as equal for text fields', () => {
    const containsSources = [...getValueSources(config, 'textPrimary', 'like')].sort();
    const equalSources = [...getValueSources(config, 'textPrimary', 'equal')].sort();

    expect(containsSources).toEqual(equalSources);
    expect(containsSources).toEqual(expect.arrayContaining(['value', 'field', 'func']));
  });

  it('does-not-contain uses the same value-source options as not-equal for text fields', () => {
    const notContainsSources = [...getValueSources(config, 'textPrimary', 'not_like')].sort();
    const notEqualSources = [...getValueSources(config, 'textPrimary', 'not_equal')].sort();

    expect(notContainsSources).toEqual(notEqualSources);
    expect(notContainsSources).toEqual(expect.arrayContaining(['value', 'field', 'func']));
  });

  it('contains operators do not lock to text-only valueTypes', () => {
    expect(queryBuilderConfig.operators.like?.valueTypes).toBeUndefined();
    expect(queryBuilderConfig.operators.not_like?.valueTypes).toBeUndefined();
  });

  it('boolean fields only allow direct value sources', () => {
    const booleanOperators = QbUtils.ConfigUtils.getOperatorsForField(config, 'boolPrimary') ?? [];

    booleanOperators.forEach((operator) => {
      expect(getValueSources(config, 'boolPrimary', operator)).toEqual(['value']);
    });
  });
});

describe('QueryBuilder sample-data coverage', () => {
  const dataset = createCityDataset(100);

  it('creates a 100-record dataset with meaningful variation', () => {
    expect(dataset).toHaveLength(100);
    expect(new Set(dataset.map((row) => row.city)).size).toBeGreaterThanOrEqual(30);
    expect(new Set(dataset.map((row) => row.country)).size).toBeGreaterThan(10);
    expect(new Set(dataset.map((row) => row.population)).size).toBeGreaterThan(20);
  });

  it('evaluates text OR query across city and country fields', () => {
    const query = {
      or: [
        { in: ['a', { var: 'country' }] },
        { in: ['b', { var: 'city' }] },
      ],
    };

    const expected = dataset.filter((row) => row.country.includes('a') || row.city.includes('b'));
    const actual = runJsonLogicFilter(query, dataset);

    expect(actual.map((row) => row.id)).toEqual(expected.map((row) => row.id));
  });

  it('evaluates combined numeric and text conditions', () => {
    const query = {
      and: [
        { '>=': [{ var: 'population' }, 15] },
        { '<=': [{ var: 'area' }, 1800] },
        { in: ['coastal', { var: 'funFact' }] },
      ],
    };

    const expected = dataset.filter((row) => row.population >= 15 && row.area <= 1800 && row.funFact.includes('coastal'));
    const actual = runJsonLogicFilter(query, dataset);

    expect(actual.map((row) => row.id)).toEqual(expected.map((row) => row.id));
  });

  it('evaluates nested OR/AND query with inequality and contains checks', () => {
    const query = {
      or: [
        { '==': [{ var: 'country' }, 'Japan'] },
        {
          and: [
            { '!=': [{ var: 'city' }, 'Tokyo Central'] },
            { in: ['Mountain', { var: 'funFact' }] },
            { '>': [{ var: 'population' }, 8] },
          ],
        },
      ],
    };

    const expected = dataset.filter((row) => (
      row.country === 'Japan' ||
      (row.city !== 'Tokyo Central' && row.funFact.includes('Mountain') && row.population > 8)
    ));
    const actual = runJsonLogicFilter(query, dataset);

    expect(actual.map((row) => row.id)).toEqual(expected.map((row) => row.id));
  });
});
