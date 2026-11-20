using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    /// <summary>
    /// Records when an OTP was used, so that a one-time pin can only be accepted once
    /// </summary>
    [Migration(20261111120000)]
    public class M20261111120000 : OneWayMigration
    {
        /// <summary>
        /// Adds the <c>ConsumedOn</c> column to <c>Frwk_OtpAuditItems</c>
        /// </summary>
        public override void Up()
        {
            if (!Schema.Table("Frwk_OtpAuditItems").Column("ConsumedOn").Exists())
            {
                Alter.Table("Frwk_OtpAuditItems")
                    .AddColumn("ConsumedOn").AsDateTime().Nullable();
            }
        }
    }
}
