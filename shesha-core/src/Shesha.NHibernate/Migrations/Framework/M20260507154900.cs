using FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20260507154900), MsSqlOnly]
    public class M20260507154900 : AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_OtpAuditItems").AlterColumn("RecipientId").AsString(100).Nullable();
        }
    }
}
