using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20250120095800)]
    public class M20250120095800: Migration
    {
        public override void Up()
        {
            //rename the column
            Rename.Column("Core_CanOtpOut").OnTable("Core_NotificationTypeConfigs").To("Core_CanOptOut");

            //rename the columns
            Rename.Column("Core_SupportedFormatLkp").OnTable("Core_NotificationChannelConfigs").To("SupportedFormatLkp");
            Rename.Column("Core_MaxMessageSize").OnTable("Core_NotificationChannelConfigs").To("MaxMessageSize");
            Rename.Column("Core_SupportedMechanismLkp").OnTable("Core_NotificationChannelConfigs").To("SupportedMechanismLkp");
            Rename.Column("Core_SenderTypeName").OnTable("Core_NotificationChannelConfigs").To("SenderTypeName");
            Rename.Column("Core_DefaultPriorityLkp").OnTable("Core_NotificationChannelConfigs").To("DefaultPriorityLkp");
            Rename.Column("Core_StatusLkp").OnTable("Core_NotificationChannelConfigs").To("StatusLkp");

            Alter.Table("Core_NotificationChannelConfigs").AddColumn("SupportsAttachment").AsBoolean().NotNullable().WithDefaultValue(false);
        }

        public override void Down()
        {
        }
    }
}
