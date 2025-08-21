using FluentMigrator;
using Shesha.FluentMigrator;
using System.Collections.Generic;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20250623120099)]
    public class M20250623120099 : OneWayMigration
    {
        public override void Up()
        {
            if (!Schema.Schema("frwk").Exists())
                Create.Schema("frwk");

            // Shesha.Domain.Module
            Create.Table("modules").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance)
                .WithTenantIdAsNullable(SnakeCaseDbObjectNames.Instance)
                .WithColumn("accessor").AsString(200).Nullable()
                .WithColumn("current_version_no").AsString(50).Nullable()
                .WithColumn("description").AsStringMax().Nullable()
                .WithColumn("first_initialized_date").AsDateTime().Nullable()
                .WithColumn("friendly_name").AsString(200).Nullable()
                .WithColumn("is_editable").AsBoolean()
                .WithColumn("is_enabled").AsBoolean()
                .WithColumn("is_root_module").AsBoolean()
                .WithColumn("last_initialized_date").AsDateTime().Nullable()
                .WithColumn("name").AsString(300).NotNullable()
                .WithColumn("publisher").AsString(200).Nullable();

            // Shesha.Domain.ConfigurationItem
            Create.Table("configuration_items").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance)
                .WithColumn("item_type").AsString(50).NotNullable()
                .WithColumn("name").AsString(200).Nullable()
                .WithColumn("suppress").AsBoolean()
                .WithColumn("surface_status").AsInt64().Nullable();

            // Shesha.Domain.ConfigurationItemFolder
            Create.Table("configuration_item_folders").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance)
                .WithColumn("description").AsStringMax().NotNullable().WithDefaultValue(string.Empty)
                .WithColumn("name").AsString(300).NotNullable();

            // Shesha.Domain.ConfigurationItemRevision
            Create.Table("configuration_item_revisions").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance)
                .WithColumn("comments").AsStringMax().Nullable()
                .WithColumn("config_hash").AsStringMax().Nullable()
                .WithColumn("description").AsStringMax().Nullable()
                .WithColumn("is_compressed").AsBoolean()
                .WithColumn("label").AsString(200).Nullable()
                .WithColumn("version_name").AsStringMax().Nullable()
                .WithColumn("version_no").AsInt32()
                .WithDiscriminator("frwk_discriminator");

            // Shesha.Domain.EntityConfig
            Create.Table("entity_configs").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("class_name").AsString(500).Nullable()
                .WithColumn("discriminator_value").AsString(255).Nullable()
                .WithColumn("entity_config_type_lkp").AsInt64().Nullable()
                .WithColumn("namespace").AsString(500).Nullable()
                .WithColumn("schema_name").AsString(255).Nullable()
                .WithColumn("table_name").AsString(255).Nullable()
                .WithColumn("id_column").AsString(255).Nullable()
                .WithColumn("created_in_db").AsBoolean().Nullable();

            // Shesha.Domain.EntityConfigRevision
            Create.Table("entity_config_revisions").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("accessor").AsString(200).Nullable()
                .WithColumn("generate_app_service").AsBoolean().Nullable()
                .WithColumn("properties_md5").AsString(40).Nullable()
                .WithColumn("source_lkp").AsInt64().Nullable()
                .WithColumn("type_short_alias").AsString(100).Nullable()
                .WithColumn("view_configurations").AsStringMax().Nullable();

            // Shesha.Domain.EntityProperty
            Create.Table("entity_properties").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance)
                .WithColumn("audited").AsBoolean()
                .WithColumn("cascade_create").AsBoolean()
                .WithColumn("cascade_delete_unreferenced").AsBoolean()
                .WithColumn("cascade_update").AsBoolean()
                .WithColumn("data_format").AsString(100).Nullable()
                .WithColumn("data_type").AsString(100).Nullable()
                .WithColumn("description").AsStringMax().Nullable()
                .WithColumn("entity_type").AsString(300).Nullable()
                .WithColumn("is_framework_related").AsBoolean()
                .WithColumn("label").AsString(300).Nullable()
                .WithColumn("max").AsDouble().Nullable()
                .WithColumn("max_length").AsInt32().Nullable()
                .WithColumn("min").AsDouble().Nullable()
                .WithColumn("min_length").AsInt32().Nullable()
                .WithColumn("name").AsStringMax().Nullable()
                .WithColumn("read_only").AsBoolean()
                .WithColumn("reference_list_module").AsString(300).Nullable()
                .WithColumn("reference_list_name").AsString(100).Nullable()
                .WithColumn("reg_exp").AsStringMax().Nullable()
                .WithColumn("required").AsBoolean()
                .WithColumn("sort_order").AsInt32().Nullable()
                .WithColumn("source_lkp").AsInt64().Nullable()
                .WithColumn("suppress").AsBoolean()
                .WithColumn("validation_message").AsStringMax().Nullable()
                .WithColumn("created_in_db").AsBoolean().Nullable()
                .WithColumn("column_name").AsString(255).Nullable()
                .WithColumn("list_configuration").AsStringMax().Nullable()
                .WithColumn("formatting").AsStringMax().Nullable();

            // Shesha.Domain.FormConfigurationRevision
            Create.Table("form_configuration_revisions").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("is_template").AsBoolean().Nullable()
                .WithColumn("markup").AsStringMax().Nullable()
                .WithColumn("model_type").AsStringMax().Nullable();

            // Shesha.Domain.PermissionDefinitionRevision
            Create.Table("permission_definition_revisions").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("parent").AsStringMax().Nullable();

            // Shesha.Domain.ReferenceListRevision
            Create.Table("reference_list_revisions").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("hard_link_to_application").AsBoolean().Nullable()
                .WithColumn("namespace").AsString(300).Nullable()
                .WithColumn("no_selection_value").AsInt64().Nullable();

            // Shesha.Domain.SettingConfigurationRevision
            Create.Table("setting_config_revisions").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("access_mode").AsInt64().Nullable()
                .WithColumn("category").AsString(200).Nullable()
                .WithColumn("client_access_lkp").AsInt64().Nullable()
                .WithColumn("data_type").AsString(100).Nullable()
                .WithColumn("data_format").AsString(100).Nullable()
                .WithColumn("editor_form_module").AsString(200).Nullable()
                .WithColumn("editor_form_name").AsString(200).Nullable()
                .WithColumn("is_client_specific").AsBoolean().Nullable()
                .WithColumn("is_user_specific").AsBoolean().Nullable()
                .WithColumn("order_index").AsInt32().Nullable();

            // Shesha.Domain.NotificationChannelConfigRevision
            Create.Table("notification_channel_revisions").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("default_priority_lkp").AsInt64().Nullable()
                .WithColumn("max_message_size").AsInt32().Nullable()
                .WithColumn("sender_type_name").AsStringMax().Nullable()
                .WithColumn("status_lkp").AsInt64().Nullable()
                .WithColumn("supported_format_lkp").AsInt64().Nullable()
                .WithColumn("supported_mechanism_lkp").AsInt64().Nullable()
                .WithColumn("supports_attachment").AsBoolean().Nullable();

            // Shesha.Domain.NotificationTypeConfigRevision
            Create.Table("notification_type_revisions").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("allow_attachments").AsBoolean().Nullable()
                .WithColumn("can_opt_out").AsBoolean().Nullable()
                .WithColumn("category").AsStringMax().Nullable()
                .WithColumn("disable").AsBoolean().Nullable()
                .WithColumn("is_time_sensitive").AsBoolean().Nullable()
                .WithColumn("order_index").AsInt32().Nullable()
                .WithColumn("override_channels").AsStringMax().Nullable();

            // Shesha.Domain.ShaRolePermission
            Create.Table("role_permissions").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance)
                .WithTenantIdAsNullable(SnakeCaseDbObjectNames.Instance)
                .WithColumn("is_granted").AsBoolean()
                .WithColumn("permission").AsStringMax().Nullable();

            // Shesha.Domain.ShaRoleRevision
            Create.Table("role_revisions").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("hard_link_to_application").AsBoolean().Nullable()
                .WithColumn("name_space").AsString(200).Nullable();

            // Shesha.Domain.FrontEndApp
            Create.Table("front_end_apps").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance)
                .WithTenantIdAsNullable(SnakeCaseDbObjectNames.Instance)
                .WithColumn("app_key").AsString(100)
                .WithColumn("description").AsStringMax().Nullable()
                .WithColumn("name").AsString(100);

            Execute.Sql("create unique index uq_frwk_front_end_apps_name on frwk.front_end_apps(app_key) where is_deleted=0");

            // Shesha.Domain.ConfigurationItem
            Alter.Table("configuration_items").InSchema("frwk")
                .AddColumn("application_id").AsGuid().Nullable().ForeignKey("fk_configuration_items_application_id", "frwk", "front_end_apps", "id").Indexed()
                .AddColumn("exposed_from_revision_id").AsGuid().Nullable().ForeignKey("fk_configuration_items_exposed_from_revision_id", "frwk", "configuration_item_revisions", "id").Indexed()
                .AddColumn("folder_id").AsGuid().Nullable().ForeignKey("fk_configuration_items_folder_id", "frwk", "configuration_item_folders", "id").Indexed()
                .AddColumn("module_id").AsGuid().Nullable().ForeignKey("fk_configuration_items_module_id", "frwk", "modules", "Id").Indexed()
                .AddColumn("origin_id").AsGuid().Nullable().ForeignKey("fk_configuration_items_origin_id", "frwk", "configuration_items", "id").Indexed();

            // Shesha.Domain.ConfigurationItemFolder
            Alter.Table("configuration_item_folders").InSchema("frwk")
                .AddColumn("module_id").AsGuid().Nullable().ForeignKey("fk_configuration_item_folders_module_id", "frwk", "modules", "Id").Indexed()
                .AddColumn("parent_id").AsGuid().Nullable().ForeignKey("fk_configuration_item_folders_parent_id", "frwk", "configuration_item_folders", "id").Indexed();

            // Shesha.Domain.ConfigurationItemRevision
            Alter.Table("configuration_item_revisions").InSchema("frwk")
                .AddColumn("configuration_item_id").AsGuid().NotNullable().ForeignKey("fk_configuration_item_revisions_configuration_item_id", "frwk", "configuration_items", "id").Indexed()
                .AddColumn("created_by_import_id").AsGuid().Nullable().ForeignKey("fk_configuration_item_revisions_created_by_import_id", "", "Frwk_ImportResults", "Id").Indexed()
                .AddColumn("parent_revision_id").AsGuid().Nullable().ForeignKey("fk_configuration_item_revisions_parent_revision_id", "frwk", "configuration_item_revisions", "id").Indexed();

            Alter.Table("configuration_items").InSchema("frwk")
                .AddColumn("active_revision_id").AsGuid().Nullable().ForeignKey("fk_configuration_items_active_revision_id", "frwk", "configuration_item_revisions", "id").Indexed()
                .AddColumn("latest_revision_id").AsGuid().Nullable().ForeignKey("fk_configuration_items_latest_revision_id", "frwk", "configuration_item_revisions", "id").Indexed();

            // Shesha.Domain.EntityConfig
            Alter.Table("entity_configs").InSchema("frwk")
                .AddColumn("inherited_from_id").AsGuid().Nullable().ForeignKey("fk_entity_configs_inherited_from_id", "frwk", "entity_configs", "id").Indexed();

            // Shesha.Domain.EntityProperty
            Alter.Table("entity_properties").InSchema("frwk")
                .AddColumn("inherited_from_id").AsGuid().Nullable().ForeignKey("fk_entity_properties_inherited_from_id", "frwk", "entity_properties", "id").Indexed()
                .AddColumn("entity_config_revision_id").AsGuid().Nullable().ForeignKey("fk_entity_properties_entity_config_revision_id", "frwk", "configuration_item_revisions", "id").Indexed()
                .AddColumn("items_type_id").AsGuid().Nullable().ForeignKey("fk_entity_properties_items_type_id", "frwk", "entity_properties", "id").Indexed()
                .AddColumn("parent_property_id").AsGuid().Nullable().ForeignKey("fk_entity_properties_parent_property_id", "frwk", "entity_properties", "id").Indexed();

            // Shesha.Domain.ShaRoleAppointment
            Create.Table("role_appointments").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance)
                .WithDiscriminator("frwk_discriminator")
                .WithColumn("permissioned_entity1_id").AsString(100).Nullable()
                .WithColumn("permissioned_entity1_class_name").AsString(1000).Nullable()
                .WithColumn("permissioned_entity1_display_name").AsString(1000).Nullable()
                .WithColumn("permissioned_entity2_id").AsString(100).Nullable()
                .WithColumn("permissioned_entity2_class_name").AsString(1000).Nullable()
                .WithColumn("permissioned_entity2_display_name").AsString(1000).Nullable()
                .WithColumn("permissioned_entity3_id").AsString(100).Nullable()
                .WithColumn("permissioned_entity3_class_name").AsString(1000).Nullable()
                .WithColumn("permissioned_entity3_display_name").AsString(1000).Nullable()
                .WithColumn("from_date").AsDateTime().Nullable()
                .WithColumn("to_date").AsDateTime().Nullable()
                .WithColumn("status_lkp").AsInt64().Nullable()                
                .WithColumn("role_id").AsGuid().Nullable().ForeignKey("fk_role_appointments_role_id", "frwk", "configuration_items", "id").Indexed();

            // Shesha.Domain.ShaRolePermission
            Alter.Table("role_permissions").InSchema("frwk")
                .AddColumn("role_revision_id").AsGuid().Nullable().ForeignKey("fk_role_permissions_role_revision_id", "frwk", "configuration_item_revisions", "id").Indexed();

            // Shesha.Domain.ShaRoleAppointedPerson
            Alter.Table("role_appointments").InSchema("frwk")
                .AddColumn("person_id").AsGuid().Nullable().ForeignKey("fk_role_appointments_person_id", "", "Core_Persons", "Id").Indexed();
            
            var headerTables = new List<string>{
                "entity_configs",
            };

            foreach (var headerTable in headerTables)
            {
                Create.ForeignKey($"fk_{headerTable}_ci_id")
                    .FromTable(headerTable).InSchema("frwk")
                    .ForeignColumn("id")
                    .ToTable("configuration_items").InSchema("frwk")
                    .PrimaryColumn("id");
            }

            var revisionTables = new List<string>{
                "entity_config_revisions",
                "form_configuration_revisions",
                "permission_definition_revisions",
                "reference_list_revisions",
                "setting_config_revisions",
                "notification_channel_revisions",
                "notification_type_revisions",
                "role_revisions"
            };

            foreach (var revisionTable in revisionTables)
            {
                Create.ForeignKey($"fk_{revisionTable}_ci_revisions_id")
                    .FromTable(revisionTable).InSchema("frwk")
                    .ForeignColumn("id")
                    .ToTable("configuration_item_revisions").InSchema("frwk")
                    .PrimaryColumn("id");
            }
        }
    }
}