using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20261007120000)]
    public class M20261007120000 : OneWayMigration
    {
        public override void Up()
        {
            Create.Table("otp_configs").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithColumn("notification_type_id").AsGuid().Nullable().ForeignKey("fk_otp_configs_notification_type_id", "frwk", "configuration_items", "id").Indexed()
                .WithColumn("lifetime").AsInt32().Nullable()
                .WithColumn("pin_type_lkp").AsInt64().NotNullable().WithDefaultValue(1)
                .WithColumn("pin_length").AsInt32().Nullable()
                .WithColumn("alphabet").AsString(100).Nullable();

            Create.ForeignKey("fk_otp_configs_ci_id")
                .FromTable("otp_configs").InSchema("frwk")
                .ForeignColumn("id")
                .ToTable("configuration_items").InSchema("frwk")
                .PrimaryColumn("id");

            Alter.Table("otp_audit_items").InSchema("frwk")
                .AddColumn("otp_config_id").AsGuid().Nullable().ForeignKey("fk_otp_audit_items_otp_config_id", "frwk", "configuration_items", "id").Indexed()
                .AddColumn("owner_id").AsString(100).Nullable()
                .AddColumn("owner_class_name").AsString(1000).Nullable();
        }
    }
}
