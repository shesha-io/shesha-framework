using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20251122200899)]
    public class M20251122200899 : OneWayMigration
    {
        public override void Up()
        {
            // Shesha.Domain.ShaUserLoginAttempt
            Create.Table("user_login_attempts").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithTenantIdAsNullable(SnakeCaseDbObjectNames.Instance).Indexed()
                .WithColumn("browser_info").AsString(512).Nullable()
                .WithColumn("client_ip_address").AsString(64).Nullable()
                .WithColumn("client_name").AsString(128).Nullable()
                .WithColumn("creation_time").AsDateTime()
                .WithColumn("device_name").AsString(255).Nullable()
                .WithColumn("imei").AsString(20).Nullable()
                .WithColumn("login_attempt_number").AsInt32().Nullable()
                .WithColumn("result_lkp").AsInt64()
                .WithColumn("tenancy_name").AsString(64).Nullable()
                .WithColumn("user_id").AsInt64().Nullable().Indexed()
                .WithColumn("user_name_or_email_address").AsString(255);

            // Shesha.Domain.ShaUserRegistration
            Create.Table("user_registrations").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("additional_registration_info_form_module").AsString(200).Nullable()
                .WithColumn("additional_registration_info_form_name").AsString(200).Nullable()
                .WithColumn("creation_time").AsDateTime()
                .WithColumn("go_to_url_after_registration").AsStringMax().Nullable()
                .WithColumn("is_complete").AsBoolean().WithDefaultValue(false)
                .WithColumn("user_id").AsInt64().Indexed()
                .WithColumn("user_name_or_email_address").AsString(255);

            // Shesha.Domain.StoredFile
            Create.Table("stored_files").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance, true)
                .WithTenantIdAsNullable(SnakeCaseDbObjectNames.Instance).Indexed()
                .WithColumn("owner_id").AsString(100).Nullable()
                .WithColumn("owner_class_name").AsString(1000).Nullable()
                .WithColumn("category").AsString(1000).Nullable()
                .WithColumn("description").AsStringMax().Nullable()
                .WithColumn("file_name").AsStringMax()
                .WithColumn("file_type").AsString(50)
                .WithColumn("folder").AsStringMax().Nullable()
                .WithColumn("is_version_controlled").AsBoolean()
                .WithColumn("parent_file_id").AsGuid().Nullable().Indexed()
                .WithColumn("sort_order").AsInt32()
                .WithColumn("temporary").AsBoolean().WithDefaultValue(false);

            // Shesha.Domain.StoredFileVersion
            Create.Table("stored_file_versions").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance, true)
                .WithTenantIdAsNullable(SnakeCaseDbObjectNames.Instance).Indexed()
                .WithColumn("description").AsStringMax().Nullable()
                .WithColumn("file_id").AsGuid().Nullable().Indexed()
                .WithColumn("file_name").AsStringMax()
                .WithColumn("file_size").AsInt64()
                .WithColumn("file_type").AsString(50)
                .WithColumn("is_last").AsBoolean()
                .WithColumn("is_signed").AsBoolean()
                .WithColumn("version_no").AsInt32();

            // Shesha.Domain.VersionedField
            Create.Table("versioned_fields").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance, true)
                .WithTenantIdAsNullable(SnakeCaseDbObjectNames.Instance).Indexed()
                .WithColumn("name").AsString(1023)
                .WithColumn("frwk_owner_id").AsString(255).Nullable()
                .WithColumn("frwk_owner_type").AsString(100).Nullable()
                .WithColumn("track_versions").AsBoolean();

            // Shesha.Domain.VersionedFieldVersion
            Create.Table("versioned_field_versions").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance, true)
                .WithTenantIdAsNullable(SnakeCaseDbObjectNames.Instance).Indexed()
                .WithColumn("content").AsStringMax()
                .WithColumn("field_id").AsGuid().Nullable().Indexed()
                .WithColumn("is_last").AsBoolean();

            // Shesha.Domain.OtpAuditItem
            Create.Table("otp_audit_items").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance, true)
                .WithColumn("action_type").AsString(100).Nullable()
                .WithColumn("error_message").AsStringMax().Nullable()
                .WithColumn("expires_on").AsDateTime().Nullable()
                .WithColumn("otp").AsString(100)
                .WithColumn("recipient_id").AsString(100).Nullable()
                .WithColumn("recipient_type").AsString(100).Nullable()
                .WithColumn("send_status_lkp").AsInt64()
                .WithColumn("send_to").AsString(200)
                .WithColumn("send_type_lkp").AsInt64()
                .WithColumn("sent_on").AsDateTime().Nullable();

            // Shesha.Domain.MobileDevice
            Create.Table("mobile_devices").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance, true)
                .WithColumn("imei").AsString(30)
                .WithColumn("is_locked").AsBoolean().WithDefaultValue(false)
                .WithColumn("last_bearing").AsDecimal().Nullable()
                .WithColumn("last_heart_beat_is_stationary").AsBoolean().Nullable()
                .WithColumn("last_heart_beat_time").AsDateTime().Nullable()
                .WithColumn("last_lat").AsDecimal().Nullable()
                .WithColumn("last_long").AsDecimal().Nullable()
                .WithColumn("last_speed").AsDecimal().Nullable()
                .WithColumn("name").AsString(300)
                .WithColumn("stationary_lat").AsDecimal().Nullable()
                .WithColumn("stationary_long").AsDecimal().Nullable()
                .WithColumn("stationary_time").AsDateTime().Nullable()
                .WithDiscriminator("frwk_discriminator");

            // Shesha.Domain.DeviceForceUpdate
            Create.Table("device_force_updates").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance, true)
                .WithColumn("app_store_url").AsString(255).Nullable()
                .WithColumn("description").AsString(1000).Nullable()
                .WithColumn("name").AsString(300)
                .WithColumn("os_type").AsInt32().Nullable()
                .WithColumn("version_no").AsDouble().Nullable()
                .WithDiscriminator("frwk_discriminator");

            // Shesha.Domain.BootstrapperStartup
            Create.Table("bootstrapper_startups").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("bootstrapper_name").AsStringMax()
                .WithColumn("context").AsStringMax().Nullable()
                .WithColumn("creation_time").AsDateTime()
                .WithColumn("finished_on").AsDateTime().Nullable()
                .WithColumn("force").AsBoolean()
                .WithColumn("result").AsStringMax().Nullable()
                .WithColumn("started_on").AsDateTime().Nullable()
                .WithColumn("status").AsInt64();

            // Shesha.Domain.ApplicationStartup
            Create.Table("application_startups").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("account").AsString(100).Nullable()
                .WithColumn("bootstrappers_disabled").AsBoolean()
                .WithColumn("error_message").AsStringMax().Nullable()
                .WithColumn("finished_on").AsDateTime().Nullable()
                .WithColumn("folder").AsStringMax().Nullable()
                .WithColumn("machine_name").AsString(100).Nullable()
                .WithColumn("migrations_disabled").AsBoolean()
                .WithColumn("started_on").AsDateTime()
                .WithColumn("status").AsInt64();

            // Shesha.Domain.ApplicationStartupAssembly
            Create.Table("application_startup_assemblies").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("application_startup_id").AsGuid().NotNullable().Indexed()
                .WithColumn("file_md5").AsString(50)
                .WithColumn("file_name").AsStringMax()
                .WithColumn("file_path").AsStringMax().Nullable()
                .WithColumn("file_version").AsString(100).Nullable()
                .WithColumn("product_version").AsString(100).Nullable();

            // Shesha.Domain.ImportResult
            Create.Table("import_results").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance, true)
                .WithTenantIdAsNullable(SnakeCaseDbObjectNames.Instance).Indexed()
                .WithColumn("avg_speed").AsDecimal()
                .WithColumn("comment").AsString(300)
                .WithColumn("error_message").AsStringMax()
                .WithColumn("finished_on").AsDateTime().Nullable()
                .WithColumn("imported_file_id").AsGuid().Nullable().Indexed()
                .WithColumn("imported_file_md5").AsString(50)
                .WithColumn("is_success").AsBoolean()
                .WithColumn("log_file_id").AsGuid().Nullable().Indexed()
                .WithColumn("log_file_path").AsString(300)
                .WithColumn("rows_affected").AsInt32()
                .WithColumn("rows_inactivated").AsInt32()
                .WithColumn("rows_inserted").AsInt32()
                .WithColumn("rows_skipped").AsInt32()
                .WithColumn("rows_skipped_not_changed").AsInt32()
                .WithColumn("rows_updated").AsInt32()
                .WithColumn("source_type_lkp").AsInt64().Nullable()
                .WithColumn("started_on").AsDateTime().Nullable()
                .WithDiscriminator("frwk_discriminator");

            // Shesha.Domain.ConfigurationPackageImportResult
            Alter.Table("import_results").InSchema("frwk")
                .AddColumn("application_startup_assembly_id").AsGuid().Nullable().Indexed();

            Create.Table("hi_lo_sequences").InSchema("frwk")
                .WithColumn("sequence_name").AsString(200).NotNullable().PrimaryKey()
                .WithColumn("next_value").AsInt64().NotNullable();
        }
    }
}
