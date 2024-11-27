import { nanoid } from '@/utils/uuid';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { IExpressionExecuterArguments, executeScriptSync } from '@/providers/form/utils';

const NEW_KEY = ['{{NEW_KEY}}', '{{GEN_KEY}}'];

export const generateNewKey = (json: object) => {
  try {
    let stringify = JSON.stringify(json);

    NEW_KEY.forEach((key) => {
      stringify = stringify.replaceAll(key, nanoid());
    });

    return JSON.parse(stringify);
  } catch {
    return json;
  }
};

export const filterVisibility =
  (context: IExpressionExecuterArguments) =>
  ({ customVisibility }: IConfigurableColumnsProps) => {
    if (customVisibility) {
      return executeScriptSync(customVisibility, context);
    }

    return true;
  };
