using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    /// <summary>
    /// Adds a verification attempt counter to OTPs so that a one-time pin can't be brute-forced
    /// </summary>
    [Migration(20261120120099)]
    public class M20261120120099 : OneWayMigration
    {
        /// <summary>
        /// Adds the <c>verify_attempts</c> column to <c>frwk.otp_audit_items</c>
        /// </summary>
        public override void Up()
        {
            if (!Schema.Schema("frwk").Table("otp_audit_items").Column("verify_attempts").Exists())
            {
                Alter.Table("otp_audit_items").InSchema("frwk")
                    .AddColumn("verify_attempts").AsInt32().NotNullable().WithDefaultValue(0);
            }
        }
    }
}
