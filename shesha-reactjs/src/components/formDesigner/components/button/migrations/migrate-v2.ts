import { SettingsMigrationContext } from "../../../../..";
import { IButtonProps } from "../button";
import { upgradeActionConfig } from '../../_common-migrations/upgrade-action-owners';

export const migrateV1toV2 = (props: IButtonProps, context: SettingsMigrationContext): IButtonProps => {
    const { actionConfiguration } = props;

    return { ...props, actionConfiguration: upgradeActionConfig(actionConfiguration, context) };
}