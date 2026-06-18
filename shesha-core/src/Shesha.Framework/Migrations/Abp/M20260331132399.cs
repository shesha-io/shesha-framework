using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Abp
{
    [Migration(20260331132399)]
    public class M20260331132399 : OneWayMigration
    {
        public override void Up()
        {
            // Upgraded_To_Abp_9_1
            // Alter Discriminator column in AbpPermissions: from nvarchar(max) to nvarchar(21) (non-nullable)
            Alter.Table("AbpPermissions")
                .AlterColumn("Discriminator")
                .AsString(21)               // nvarchar(21)
                .NotNullable();              // maintain non-nullable

            //// Add TargetNotifiers column to AbpNotificationSubscriptions
            //Alter.Table("AbpNotificationSubscriptions")
            //    .AddColumn("TargetNotifiers")
            //    .AsString(1024)              // nvarchar(1024)
            //    .Nullable();                 // nullable

            // Alter Discriminator column in AbpFeatures: from nvarchar(max) to nvarchar(21) (non-nullable)
            Alter.Table("AbpFeatures")
                .AlterColumn("Discriminator")
                .AsString(21)                // nvarchar(21)
                .NotNullable();              // maintain non-nullable

            // Upgraded_To_Abp_9_2
            Alter.Table("AbpUserLoginAttempts")
                .AddColumn("FailReason")
                .AsString(1024) // nvarchar(1024)
                .Nullable();

            // Upgraded_To_Abp_10_0
            // Upgraded_To_Abp_10_2
            Alter.Table("AbpAuditLogs")
                .AlterColumn("Parameters")
                .AsString(4096)   // nvarchar(2048)
                .Nullable();      // remains nullable
        }
    }
}
