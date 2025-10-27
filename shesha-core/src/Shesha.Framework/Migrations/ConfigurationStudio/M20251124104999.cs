using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20251124104999)]
    public class M20251124104999 : OneWayMigration
    {
        public override void Up()
        {
            Delete.Table("Frwk_DeviceForceUpdates");
            Delete.Table("Frwk_UserRegistration");
            Delete.Table("Frwk_OtpAuditItems");
            Delete.Table("Frwk_MobileDevices");
            Delete.Table("Frwk_ImportResults");
            Delete.Table("frwk_bootstrapper_startups");
            Delete.Table("frwk_application_startup_assemblies");
            Delete.Table("frwk_application_startups");
            Delete.Table("Frwk_VersionedFieldVersions");
            Delete.Table("Frwk_VersionedFields");
            Delete.Table("Frwk_StoredFileVersions");
            Delete.Table("Frwk_StoredFiles");
            Delete.Table("Frwk_UserLoginAttempts");
            Delete.Table("Frwk_HiLoSequences");            
        }
    }
}
