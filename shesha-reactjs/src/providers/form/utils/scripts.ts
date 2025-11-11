import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";

export interface IExpressionExecuterArguments {
  [key: string]: unknown;
}

type FunctionWithArgs<TArgs, TResult> = (args: TArgs) => TResult;

export function executeScriptSync<TResult, TArgs = unknown>(expression: string, context: TArgs): TResult | undefined {
  if (!expression) throw new Error('Expression must be defined');

  try {
    const functionBody = `
    with(context) {
      ${expression}
    }
  `;
    const dynamicFunction = new Function('context', functionBody) as FunctionWithArgs<TArgs, TResult>;

    return dynamicFunction(context);
  } catch (error) {
    console.error(`executeScriptSync error`, error);
    return undefined;
  }
};

export type IExpressionExecuterFailedHandler<TResult> = (error: unknown) => TResult;
export function executeExpression<TResult>(
  expression: string,
  expressionArgs: IExpressionExecuterArguments,
  defaultValue: TResult,
  onFail: IExpressionExecuterFailedHandler<TResult>,
): TResult {
  if (expression) {
    try {
      let argsDefinition = '';
      const argList: unknown[] = [];
      for (const argumentName in expressionArgs) {
        if (expressionArgs.hasOwnProperty(argumentName)) {
          argsDefinition += (argsDefinition ? ', ' : '') + argumentName;
          argList.push(expressionArgs[argumentName]);
        }
      }

      const expressionExecuter = new Function(argsDefinition, expression);

      return expressionExecuter.apply(null, argList);
    } catch (e) {
      if (isDefined(onFail))
        return onFail(e);
    }
  }
  return defaultValue;
}

interface FunctionArgument {
  name: string;
  description?: string;
}
export type FunctionExecutor<TResult = unknown> = (...args: unknown[]) => TResult;

export const getFunctionExecutor = <TResult = unknown>(
  expression: string,
  expressionArguments: FunctionArgument[] = []): FunctionExecutor<TResult> => {
  if (!expression) throw new Error('Expression must be defined');

  const argumentsList = expressionArguments.map((a) => a.name).join(", ");

  const expressionExecuter = new Function(argumentsList, expression);
  return expressionExecuter as FunctionExecutor<TResult>;
};


type AsyncFunctionWithArgs<TArgs, TResult> = (args: TArgs) => Promise<TResult>;

const AsyncFunction = (async () => {
  // noop
}).constructor as FunctionConstructor;

export const executeScript = async <TResult, TArgs extends object = object>(
  expression: string,
  expressionArgs: TArgs,
): Promise<TResult> => {
  if (isNullOrWhiteSpace(expression))
    throw new Error('Expression must be defined');


  let argsDefinition = '';
  const argList: unknown[] = [];
  for (const argumentName in expressionArgs) {
    if (expressionArgs.hasOwnProperty(argumentName)) {
      argsDefinition += (argsDefinition ? ', ' : '') + argumentName;
      argList.push(expressionArgs[argumentName]);
    }
  }

  const asyncFn = new AsyncFunction(argsDefinition, expression) as AsyncFunctionWithArgs<TArgs, TResult>;

  const awaiter = asyncFn.apply(null, argList) as Promise<TResult>;

  return await awaiter;
};
