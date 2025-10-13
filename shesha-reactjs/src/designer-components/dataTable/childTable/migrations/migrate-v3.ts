import { IChildTableComponentProps } from '..';
import { migrateFilterMustacheExpressions } from '@/designer-components/_common-migrations/migrateUseExpression';
import { SettingsMigrationContext } from '@/interfaces/formDesigner';

export const migrateV2toV3 = (
  props: IChildTableComponentProps,
  _context: SettingsMigrationContext,
): IChildTableComponentProps => {
  const { filters } = props;

  return {
    ...props,
    filters: filters?.map((filter) => migrateFilterMustacheExpressions(filter)) ?? [],
  };
};
