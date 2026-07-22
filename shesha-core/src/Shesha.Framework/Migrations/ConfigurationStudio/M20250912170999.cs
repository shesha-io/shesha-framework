using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250912170999)]
    public class M20250912170999 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Column("entity_config_id").OnTable("entity_properties").InSchema("frwk")
                .AsGuid().NotNullable().ForeignKey("fk_entity_properties_entity_config_id", "frwk", "entity_configs", "id").Indexed();

            Delete.Column("frwk_discriminator").FromTable("configuration_item_revisions").InSchema("frwk");

            this.Shesha().MoveForeignKeys("form_configuration_revisions", "frwk", "id", "configuration_item_revisions", "frwk", "id");
            this.Shesha().MoveForeignKeys("role_revisions", "frwk", "id", "configuration_item_revisions", "frwk", "id");

            Delete.Table("form_configuration_revisions").InSchema("frwk");
            Delete.Table("reference_list_revisions").InSchema("frwk");
            Delete.Table("setting_config_revisions").InSchema("frwk");
            Delete.Table("role_revisions").InSchema("frwk");
            Delete.Table("permission_definition_revisions").InSchema("frwk");
            Delete.Table("notification_type_revisions").InSchema("frwk");
            Delete.Table("notification_channel_revisions").InSchema("frwk");
            Delete.Table("entity_config_revisions").InSchema("frwk");
        }
    }
}
