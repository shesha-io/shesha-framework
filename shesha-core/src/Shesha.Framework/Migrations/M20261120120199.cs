using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    /// <summary>
    /// Records when an OTP was used, so that a one-time pin can only be accepted once
    /// </summary>
    [Migration(20261120120199)]
    public class M20261120120199 : OneWayMigration
    {
        /// <summary>
        /// Adds the <c>consumed_on</c> column to <c>frwk.otp_audit_items</c>
        /// </summary>
        public override void Up()
        {
            if (!Schema.Schema("frwk").Table("otp_audit_items").Column("consumed_on").Exists())
            {
                Alter.Table("otp_audit_items").InSchema("frwk")
                    .AddColumn("consumed_on").AsDateTime().Nullable();
            }
        }
    }
}
