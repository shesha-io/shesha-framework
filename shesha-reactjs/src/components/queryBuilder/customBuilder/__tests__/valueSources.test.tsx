import React from 'react';
import { render } from '@testing-library/react';
import { BuilderProps, Config, Fields, JsonTree, Utils as QbUtils } from '@react-awesome-query-builder/antd';

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
jest.mock('../../funcs/evaluate', () => ({
  __esModule: true,
  getEvaluateFunc: (type: string) => ({
    label: `EVALUATE_${type}`,
    returnType: type,
    hideForSelect: true,
    args: {
      expression: { label: 'Expression', type: 'text', valueSources: ['value'] },
      required: { label: 'Allow empty', type: 'boolean', valueSources: ['value'] },
    },
  }),
}));
// The real autocomplete pulls in metadata providers, but it does read `fieldDefinition.fieldSettings`,
// so the stand-in reports whether a definition was supplied.
jest.mock('../../fieldAutocomplete', () => {
  const { useFieldWidget } = require('../../widgets/field/fieldWidgetContext');
  return {
    __esModule: true,
    FieldAutocomplete: () => {
      const widgetProps = useFieldWidget();
      return React.createElement('div', {
        'data-testid': 'field-autocomplete',
        'data-has-definition': widgetProps?.fieldDefinition ? 'yes' : 'no',
      });
    },
  };
});

const { config: queryBuilderConfig } = require('../../config');
const { CustomQueryBuilder } = require('../index');

const createConfig = (): Config => {
  const fields: Fields = {
    numberPrimary: { label: 'Number Primary', type: 'number' },
    numberSecondary: { label: 'Number Secondary', type: 'number' },
    textPrimary: { label: 'Text Primary', type: 'text' },
  };

  return QbUtils.ConfigUtils.extendConfig({ ...queryBuilderConfig, fields } as Config);
};

const createActions = (): BuilderProps['actions'] =>
  new Proxy({}, { get: () => jest.fn() }) as BuilderProps['actions'];

const renderRule = (operator: string, valueSrc: string[], value: unknown[]): HTMLElement => {
  const config = createConfig();
  const jsonTree: JsonTree = {
    id: 'group-1',
    type: 'group',
    children1: [
      {
        id: 'rule-1',
        type: 'rule',
        properties: {
          field: 'numberPrimary',
          operator,
          value,
          valueSrc,
          valueType: value.map(() => 'number'),
        },
      },
    ],
  } as JsonTree;

  const { container } = render(
    React.createElement(CustomQueryBuilder, {
      actions: createActions(),
      config,
      tree: QbUtils.loadTree(jsonTree),
    }),
  );

  return container;
};

const countValueSourceSelectors = (container: HTMLElement): number =>
  container.querySelectorAll('.sha-query-builder-source-trigger--value').length;

describe('value source selectors', () => {
  it('renders one source selector for a single-value operator', () => {
    const container = renderRule('equal', ['value'], [1]);

    expect(countValueSourceSelectors(container)).toBe(1);
  });

  it('renders an independent source selector for each side of between', () => {
    const container = renderRule('between', ['value', 'value'], [1, 5]);

    expect(countValueSourceSelectors(container)).toBe(2);
  });

  it('honours a different source on each side of between', () => {
    const container = renderRule('between', ['value', 'field'], [1, 'numberSecondary']);
    const labels = Array.from(container.querySelectorAll('.sha-query-builder-source-trigger--value'))
      .map((trigger) => trigger.getAttribute('aria-label'));

    expect(labels).toEqual(['Value', 'Field']);
  });
});

describe('function editor markup', () => {
  const renderFuncRule = (): HTMLElement => {
    const config = createConfig();
    const jsonTree: JsonTree = {
      id: 'group-1',
      type: 'group',
      children1: [
        {
          id: 'rule-1',
          type: 'rule',
          properties: {
            field: 'numberPrimary',
            operator: 'equal',
            value: [{ func: 'EVALUATE_NUMBER', args: { expression: { value: '{{x}}', valueSrc: 'value' } } }],
            valueSrc: ['func'],
            valueType: ['number'],
          },
        },
      ],
    } as JsonTree;

    const { container } = render(
      React.createElement(CustomQueryBuilder, {
        actions: createActions(),
        config,
        tree: QbUtils.loadTree(jsonTree),
      }),
    );

    return container;
  };

  // The stylesheet targets these class names; when the renderer stopped emitting them the function
  // arguments silently lost their inline layout.
  it('emits the container classes the stylesheet targets', () => {
    const container = renderFuncRule();

    expect(container.querySelector('.sha-query-builder-func-editor')).not.toBeNull();
    expect(container.querySelector('.sha-query-builder-func-args')).not.toBeNull();
  });

  it('renders one slot per declared argument, keyed by argument name', () => {
    const container = renderFuncRule();

    expect(container.querySelectorAll('.sha-query-builder-func-arg')).toHaveLength(2);
    expect(container.querySelector('.sha-query-builder-func-arg--expression')).not.toBeNull();
    expect(container.querySelector('.sha-query-builder-func-arg--required')).not.toBeNull();
  });
});

describe('function argument sources', () => {
  // `LOWER(str)` declares valueSources ['value', 'field', 'func']; rendering only the value widget
  // left no way to pick which field to lowercase.
  const renderLowerRule = (): HTMLElement => {
    const config = createConfig();
    const jsonTree: JsonTree = {
      id: 'group-1',
      type: 'group',
      children1: [
        {
          id: 'rule-1',
          type: 'rule',
          properties: {
            field: 'textPrimary',
            operator: 'equal',
            value: [{ func: 'LOWER', args: { str: { value: '', valueSrc: 'value' } } }],
            valueSrc: ['func'],
            valueType: ['text'],
          },
        },
      ],
    } as JsonTree;

    const { container } = render(
      React.createElement(CustomQueryBuilder, {
        actions: createActions(),
        config,
        tree: QbUtils.loadTree(jsonTree),
      }),
    );

    return container;
  };

  it('gives a multi-source argument its own source selector', () => {
    const argSlot = renderLowerRule().querySelector('.sha-query-builder-func-arg--str');

    expect(argSlot).not.toBeNull();
    expect(argSlot?.querySelector('.sha-query-builder-source-trigger')).not.toBeNull();
  });

  it('leaves a single-source argument without a selector', () => {
    const container = renderLowerRule();
    const argSlots = container.querySelectorAll('.sha-query-builder-func-arg');

    // LOWER declares exactly one argument, so the only selector present is the one for `str`.
    expect(argSlots).toHaveLength(1);
  });
});

describe('default function selection', () => {
  const createSpyActions = (): { actions: BuilderProps['actions']; setFuncValue: jest.Mock } => {
    const setFuncValue = jest.fn();
    const actions = new Proxy(
      { setFuncValue },
      { get: (target: Record<string, unknown>, prop: string) => prop in target ? target[prop] : jest.fn() },
    ) as BuilderProps['actions'];

    return { actions, setFuncValue };
  };

  const funcRuleTree = (): JsonTree => ({
    id: 'group-1',
    type: 'group',
    children1: [
      {
        id: 'rule-1',
        type: 'rule',
        properties: { field: 'textPrimary', operator: 'equal', value: [], valueSrc: ['func'], valueType: ['text'] },
      },
    ],
  } as JsonTree);

  // A store that declines to persist the default must not re-trigger the effect: that loop crashed
  // the tab when switching a rule's source to Function.
  it('applies the default function once even when the value never lands', () => {
    const config = createConfig();
    const { actions, setFuncValue } = createSpyActions();
    const element = React.createElement(CustomQueryBuilder, {
      actions,
      config,
      tree: QbUtils.loadTree(funcRuleTree()),
    });

    const { rerender } = render(element);
    rerender(element);
    rerender(element);

    const defaultApplications = setFuncValue.mock.calls.filter((call) => call[3] === null);
    expect(defaultApplications).toHaveLength(1);
  });
});

describe('field-sourced function arguments', () => {
  // The autocomplete dereferences `fieldDefinition.fieldSettings`; supplying null threw a TypeError
  // as soon as an argument's source was switched to Field.
  it('supplies a field definition when an argument is sourced from a field', () => {
    const config = createConfig();
    const jsonTree: JsonTree = {
      id: 'group-1',
      type: 'group',
      children1: [
        {
          id: 'rule-1',
          type: 'rule',
          properties: {
            field: 'textPrimary',
            operator: 'equal',
            value: [{ func: 'LOWER', args: { str: { value: '', valueSrc: 'field' } } }],
            valueSrc: ['func'],
            valueType: ['text'],
          },
        },
      ],
    } as JsonTree;

    const { container } = render(
      React.createElement(CustomQueryBuilder, {
        actions: createActions(),
        config,
        tree: QbUtils.loadTree(jsonTree),
      }),
    );

    const argAutocomplete = container
      .querySelector('.sha-query-builder-func-arg--str')
      ?.querySelector('[data-testid="field-autocomplete"]');

    expect(argAutocomplete).not.toBeNull();
    expect(argAutocomplete?.getAttribute('data-has-definition')).toBe('yes');
  });
});
