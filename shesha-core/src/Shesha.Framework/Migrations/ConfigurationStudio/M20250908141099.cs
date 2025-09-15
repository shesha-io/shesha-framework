using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250908141099)]
    public class M20250908141099 : OneWayMigration
    {
        public override void Up()
        {
            Create.Table("form_configurations").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("is_template").AsBoolean().Nullable()
                .WithColumn("markup").AsStringMax().Nullable()
                .WithColumn("model_type").AsStringMax().Nullable();

            AddConfigItemFk("form_configurations");

            Create.Table("reference_lists").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("hard_link_to_application").AsBoolean().WithDefaultValue(false).NotNullable()
                .WithColumn("namespace").AsString(300).Nullable()
                .WithColumn("no_selection_value").AsInt64().Nullable();

            Alter.Table("reference_list_items").InSchema("frwk")
                .AddColumn("reference_list_id").AsGuid().Nullable().ForeignKey("fk_reference_list_items_reference_list_id", "frwk", "reference_lists", "id").Indexed();

            AddConfigItemFk("reference_lists");
            
            Alter.Table("entity_configs").InSchema("frwk")
                .AddColumn("accessor").AsString(200).Nullable()
                .AddColumn("generate_app_service").AsBoolean().NotNullable().SetExistingRowsTo(false).WithDefaultValue(false)
                .AddColumn("properties_md5").AsString(40).Nullable()
                .AddColumn("source_lkp").AsInt64().Nullable()
                .AddColumn("type_short_alias").AsString(100).Nullable()
                .AddColumn("view_configurations").AsStringMax().Nullable();

			Alter.Table("entity_properties").InSchema("frwk")
				.AddColumn("entity_config_id").AsGuid().Nullable();

            Create.Table("setting_configurations").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("access_mode").AsInt64().NotNullable()
                .WithColumn("category").AsString(200).Nullable()
                .WithColumn("client_access_lkp").AsInt64().NotNullable()
                .WithColumn("data_type").AsString(100).NotNullable()
                .WithColumn("data_format").AsString(100).Nullable()
                .WithColumn("editor_form_module").AsString(200).Nullable()
                .WithColumn("editor_form_name").AsString(200).Nullable()
                .WithColumn("is_client_specific").AsBoolean().NotNullable().WithDefaultValue(false)
                .WithColumn("is_user_specific").AsBoolean().NotNullable().WithDefaultValue(false)
                .WithColumn("order_index").AsInt32().NotNullable().WithDefaultValue(0);

            AddConfigItemFk("setting_configurations");

            Create.Table("roles").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("hard_link_to_application").AsBoolean().NotNullable().WithDefaultValue(false)
                .WithColumn("name_space").AsString(200).Nullable();

            AddConfigItemFk("roles");

            Alter.Table("role_permissions").InSchema("frwk")
                .AddColumn("role_id").AsGuid().Nullable().ForeignKey("fk_role_permissions_role_id", "frwk", "roles", "id").Indexed();

            Create.Table("permission_definitions").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("parent").AsStringMax().Nullable();

            AddConfigItemFk("permission_definitions");

            Create.Table("notification_types").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("allow_attachments").AsBoolean().NotNullable().WithDefaultValue(false)
                .WithColumn("can_opt_out").AsBoolean().NotNullable().WithDefaultValue(false)
                .WithColumn("category").AsStringMax().Nullable()
                .WithColumn("disable").AsBoolean().NotNullable().WithDefaultValue(false)
                .WithColumn("is_time_sensitive").AsBoolean().NotNullable().WithDefaultValue(false)
                .WithColumn("override_channels").AsStringMax().NotNullable().WithDefaultValue("");

            AddConfigItemFk("notification_types");

            Create.Table("notification_templates").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance)
                .WithColumn("body_template").AsStringMax().NotNullable().WithDefaultValue("")
                .WithColumn("message_format_lkp").AsInt64().NotNullable()
                .WithColumn("title_template").AsStringMax().NotNullable().WithDefaultValue("");

            Alter.Table("notification_templates").InSchema("frwk")
                .AddColumn("part_of_id").AsGuid().NotNullable().ForeignKey("fk_notification_templates_part_of_id", "frwk", "configuration_items", "id").Indexed();

            Create.Table("notification_channels").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("default_priority_lkp").AsInt64().Nullable()
                .WithColumn("max_message_size").AsInt32().Nullable()
                .WithColumn("sender_type_name").AsStringMax().NotNullable()
                .WithColumn("status_lkp").AsInt64().Nullable()
                .WithColumn("supported_format_lkp").AsInt64().Nullable()
                .WithColumn("supported_mechanism_lkp").AsInt64().Nullable()
                .WithColumn("supports_attachment").AsBoolean().NotNullable().WithDefaultValue(false);

            AddConfigItemFk("notification_channels");
        }

        private void AddConfigItemFk(string configItemCustomTable) 
        {
            Create.ForeignKey($"fk_{configItemCustomTable}_ci_id")
                    .FromTable(configItemCustomTable).InSchema("frwk")
                    .ForeignColumn("id")
                    .ToTable("configuration_items").InSchema("frwk")
                    .PrimaryColumn("id");
        }
    }
}
