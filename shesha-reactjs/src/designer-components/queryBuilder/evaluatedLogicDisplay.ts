import { useEffect, useRef, useState } from 'react';
import { JsonLogicFilter } from '@/interfaces/jsonLogic';
import { useMutate } from '@/hooks/useMutate';
import { createMustacheEvaluator } from '@/utils/filterEvaluation';
import { isDefined } from '@/utils/nullables';
import { isRecord } from '@/utils/object';

const JSON_LOGIC_EVALUATE_ENDPOINT = { url: '/api/services/app/JsonLogic/Evaluate', httpVerb: 'POST' };

const asEvaluateExpression = (node: Record<string, unknown>): string | undefined => {
  const args = node['evaluate'];
  if (!Array.isArray(args) || args.length !== 1) return undefined;
  const first: unknown = args[0];
  if (!isRecord(first) || typeof first['expression'] !== 'string') return undefined;
  const type = first['type'];
  return type === undefined || type === 'mustache' ? first['expression'] : undefined;
};

export const resolveExpressionsForDisplay = (logic: unknown): unknown => {
  if (Array.isArray(logic)) return logic.map(resolveExpressionsForDisplay);
  if (!isRecord(logic)) return logic;

  const expression = asEvaluateExpression(logic);
  if (expression !== undefined) {
    const result = createMustacheEvaluator().evaluate(expression, {});
    if (result.status === 'resolved') return result.value;
    return logic;
  }

  return Object.fromEntries(Object.entries(logic).map(([key, args]) => [key, resolveExpressionsForDisplay(args)]));
};

export const extractEvaluatedExpression = (response: unknown): string | undefined => {
  if (!isRecord(response)) return undefined;
  const payload = isRecord(response['result']) ? response['result'] : response;
  const expression = payload['expression'];
  return typeof expression === 'string' && expression.trim() ? expression : undefined;
};

export const useEvaluatedLogicDisplay = (value: JsonLogicFilter | undefined): string => {
  const { mutate } = useMutate();
  const mutateRef = useRef(mutate);
  const valueKey = isDefined(value) ? JSON.stringify(value) : '';
  const [display, setDisplay] = useState('');

  useEffect(() => {
    mutateRef.current = mutate;
  });

  useEffect(() => {
    if (!valueKey) {
      setDisplay('');
      return undefined;
    }

    const clientResolved = resolveExpressionsForDisplay(JSON.parse(valueKey));
    let superseded = false;
    setDisplay(JSON.stringify(clientResolved, null, 2));

    mutateRef.current(JSON_LOGIC_EVALUATE_ENDPOINT, { expression: JSON.stringify(clientResolved) })
      .then((response) => {
        if (superseded) return;
        const evaluated = extractEvaluatedExpression(response);
        if (evaluated !== undefined) setDisplay(JSON.stringify(JSON.parse(evaluated), null, 2));
      })
      .catch(() => undefined);

    return () => {
      superseded = true;
    };
  }, [valueKey]);

  return display;
};
