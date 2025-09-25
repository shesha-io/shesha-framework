import { IButtonComponentProps } from '../interfaces';
import { SettingsMigrationContext } from '@/interfaces';
import { upgradeActionConfig } from '@/components/formDesigner/components/_common-migrations/upgrade-action-owners';

export const migrateV1toV2 = (props: IButtonComponentProps, context: SettingsMigrationContext): IButtonComponentProps => {
  const { actionConfiguration } = props;

  return { ...props, actionConfiguration: upgradeActionConfig(actionConfiguration, context) };
};
