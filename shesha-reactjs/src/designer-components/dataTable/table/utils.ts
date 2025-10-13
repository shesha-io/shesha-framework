import { nanoid } from '@/utils/uuid';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { IExpressionExecuterArguments, executeScriptSync } from '@/providers/form/utils';
import { IConfigurableFormComponent, IStyleType } from "@/index";

const NEW_KEY = ['{{NEW_KEY}}', '{{GEN_KEY}}'];

export const generateNewKey = (json: IConfigurableFormComponent[]): IConfigurableFormComponent[] => {
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
    ({ customVisibility }: IConfigurableColumnsProps): boolean => {
      if (customVisibility) {
        return executeScriptSync(customVisibility, context);
      }

      return true;
    };

export const defaultStyles = (): IStyleType => {
  return {
    background: { type: 'color', color: '#fff' },
    font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI', align: 'left' },
    border: {
      border: {
        all: { width: '1px', style: 'solid', color: '#d9d9d9' },
        top: { width: '1px', style: 'solid', color: '#d9d9d9' },
        bottom: { width: '1px', style: 'solid', color: '#d9d9d9' },
        left: { width: '1px', style: 'solid', color: '#d9d9d9' },
        right: { width: '1px', style: 'solid', color: '#d9d9d9' },
      },
      radius: { all: 6, topLeft: 6, topRight: 6, bottomLeft: 6, bottomRight: 6 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: { width: '100%', height: 'auto', minHeight: '200px', maxHeight: 'none', minWidth: '0px', maxWidth: 'none' },
    shadow: {
      offsetX: 0,
      offsetY: 2,
      blurRadius: 8,
      spreadRadius: 0,
      color: 'rgba(0, 0, 0, 0.1)',
    },
  };
};
