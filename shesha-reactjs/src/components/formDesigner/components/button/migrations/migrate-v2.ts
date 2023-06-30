import { SettingsMigrationContext } from "../../../../..";
import { IButtonComponentProps } from "../interfaces";
import { upgradeActionConfig } from '../../_common-migrations/upgrade-action-owners';

export const migrateV1toV2 = (props: IButtonComponentProps, context: SettingsMigrationContext): IButtonComponentProps => {
    const { actionConfiguration } = props;

    return { ...props, actionConfiguration: upgradeActionConfig(actionConfiguration, context) };
};