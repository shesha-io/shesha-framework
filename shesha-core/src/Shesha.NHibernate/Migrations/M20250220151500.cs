using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20250220151500)]
    public class M20250220151500 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Column("RecipientId").OnTable("Frwk_OtpAuditItems").AsString(100).Nullable();
        }
    }
}