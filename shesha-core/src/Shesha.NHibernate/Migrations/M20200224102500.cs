using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200224102500)]
    public class M20200224102500: AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.ShaUserLoginAttempt
            Create.Table("Frwk_UserLoginAttempts")
                .WithIdAsGuid()
                .WithTenantIdAsNullable()
                .WithColumn("BrowserInfo").AsString(512).Nullable()
                .WithColumn("ClientIpAddress").AsString(64).Nullable()
                .WithColumn("ClientName").AsString(128).Nullable()
                .WithColumn("CreationTime").AsDateTime()
                .WithColumn("IMEI").AsString(20).Nullable()
                .WithColumn("Result").AsInt32()
                .WithColumn("TenancyName").AsString(64).Nullable()
                .WithColumn("UserId").AsInt64().Nullable()
                .WithColumn("UserNameOrEmailAddress").AsString(255).Nullable();
        }
    }
}
