using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250623120299)]
    public class M20250623120299 : OneWayMigration
    {
        public override void Up()
        {
            /**/
            Delete.ForeignKey("FK_Core_ShaRoles_RoleAppointmentTypeId_Core_RoleAppointmentTypeConfigs_Id").OnTable("Core_ShaRoles");
            Delete.Table("Core_RoleAppointmentTypeConfigs");
            /**/

            // Shesha.Domain.ReferenceListItem
            Create.Table("reference_list_items").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance)
                .WithTenantIdAsNullable(SnakeCaseDbObjectNames.Instance)
                .WithColumn("color").AsString(50).WithDefaultValue(string.Empty)
                .WithColumn("description").AsStringMax().WithDefaultValue(string.Empty)
                .WithColumn("hard_link_to_application").AsBoolean()
                .WithColumn("icon").AsString(50).WithDefaultValue(string.Empty)
                .WithColumn("item").AsString(300).WithDefaultValue(string.Empty)
                .WithColumn("item_value").AsInt64()
                .WithColumn("order_index").AsInt64()
                .WithColumn("short_alias").AsString(50).WithDefaultValue(string.Empty);

            // Shesha.Domain.SettingValue
            Create.Table("setting_values").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithAuditColumns(SnakeCaseDbObjectNames.Instance)
                .WithColumn("value").AsStringMax().Nullable();

            // Shesha.Domain.ReferenceListItem
            Alter.Table("reference_list_items").InSchema("frwk")
                .AddColumn("parent_id").AsGuid().Nullable().ForeignKey("fk_reference_list_items_parent_id", "frwk", "reference_list_items", "id").Indexed()
                .AddColumn("reference_list_revision_id").AsGuid().Nullable().ForeignKey("fk_reference_list_items_reference_list_revision_id", "frwk", "configuration_item_revisions", "id").Indexed();

            // Shesha.Domain.SettingValue
            Alter.Table("setting_values").InSchema("frwk")
                .AddColumn("application_id").AsGuid().Nullable().ForeignKey("fk_setting_values_application_id", "frwk", "front_end_apps", "id").Indexed()
                .AddColumn("setting_configuration_id").AsGuid().Nullable().ForeignKey("fk_setting_values_setting_configuration_id", "frwk", "configuration_items", "id").Indexed()
                .AddColumn("user_id").AsInt64().Nullable().ForeignKey("fk_setting_values_user_id", "", "AbpUsers", "Id").Indexed();

            ExecuteCsScript("14-copy reflist_items.sql");
            ExecuteCsScript("15-copy setting_values.sql");
            ExecuteCsScript("16-copy entity_properties.sql");

            Delete.Table("Frwk_SettingValues");
            
            Execute.Sql(@"drop view if exists ""vw_Core_ReferenceListItemvalues""");
            Execute.Sql(@"drop view if exists ""vw_Core_ReferenceListItemValues""");

            Delete.Table("Frwk_ReferenceListItems");

            Delete.Table("Frwk_SettingConfigurations");
            Delete.Table("Frwk_ReferenceLists");

            // Shesha.Domain.EntityPropertyValue
            Create.Table("entity_property_values").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance)
                .WithTenantIdAsNullable(SnakeCaseDbObjectNames.Instance)
                .WithColumn("frwk_owner_id").AsString(255).Nullable()
                .WithColumn("frwk_owner_type").AsString(100).Nullable()
                .WithColumn("value").AsStringMax().Nullable();

            // Shesha.Domain.EntityPropertyValue
            Alter.Table("entity_property_values").InSchema("frwk")
                .AddColumn("entity_property_id").AsGuid().Nullable().ForeignKey("fk_entity_property_values_entity_property_id", "frwk", "entity_properties", "id").Indexed();

            ExecuteCsScript("17-copy entity_property_values.sql");

            Delete.Table("Frwk_EntityPropertyValues");
            Delete.Table("Frwk_EntityProperties");
            Delete.Table("Frwk_EntityConfigs");

            IfDatabase("SqlServer").Execute.Sql(@"IF (OBJECT_ID('dbo.FK_SheshaFunctionalTests_TestAccounts_CaptureFormId_Frwk_FormConfigurations_Id', 'F') IS NOT NULL)
	ALTER TABLE SheshaFunctionalTests_TestAccounts DROP CONSTRAINT FK_SheshaFunctionalTests_TestAccounts_CaptureFormId_Frwk_FormConfigurations_Id;");

            if (Schema.Table("SheshaFunctionalTests_TestAccounts").Exists())
                IfDatabase("PostgreSql").Execute.Sql(@"ALTER TABLE ""SheshaFunctionalTests_TestAccounts"" DROP CONSTRAINT IF EXISTS ""FK_SheshaFunctionalTests_TestAccounts_CaptureFormId_Frwk_FormCo""");
            Delete.Table("Frwk_FormConfigurations");
            Delete.Table("Frwk_PermissionDefinitions");
            Delete.Table("Frwk_ConfigurableComponents");
            Delete.Table("Frwk_EntityVisibility");

            ExecuteCsScript("18-copy role_appointments.sql");
            ExecuteCsScript("19-copy role_permissions.sql");
        }

        private void ExecuteCsScript(string script)
        {
            IfDatabase("SqlServer").Execute.EmbeddedScript($"Shesha.Migrations.ConfigurationStudio.ScriptsMsSql.{script}");
            IfDatabase("PostgreSql").Execute.EmbeddedScript($"Shesha.Migrations.ConfigurationStudio.ScriptsPostgreSql.{script}");
        }
    }
}