using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    /// <summary>
    /// Adds a verification attempt counter to OTPs so that a one-time pin can't be brute-forced
    /// </summary>
    [Migration(20261106120000)]
    public class M20261106120000 : OneWayMigration
    {
        public override void Up()
        {
            if (!Schema.Table("Frwk_OtpAuditItems").Column("VerifyAttempts").Exists())
            {
                Alter.Table("Frwk_OtpAuditItems")
                    .AddColumn("VerifyAttempts").AsInt32().NotNullable().WithDefaultValue(0);
            }
        }
    }
}
