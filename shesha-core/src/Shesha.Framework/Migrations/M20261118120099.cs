using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    /// <summary>
    /// Single-use token for completing self-registration (additional registration information step).
    /// A database upgraded from 0.43 may already have these columns on the old <c>Frwk_UserRegistration</c> table, which the
    /// configuration studio migrations replaced, so they are added only when missing.
    /// </summary>
    [Migration(20261118120099)]
    public class M20261118120099 : OneWayMigration
    {
        /// <summary>
        /// Adds the completion token hash and expiry columns to <c>frwk.user_registrations</c>
        /// </summary>
        public override void Up()
        {
            if (!Schema.Schema("frwk").Table("user_registrations").Column("completion_token_hash").Exists())
                Alter.Table("user_registrations").InSchema("frwk").AddColumn("completion_token_hash").AsString(64).Nullable();

            if (!Schema.Schema("frwk").Table("user_registrations").Column("completion_token_expires_on").Exists())
                Alter.Table("user_registrations").InSchema("frwk").AddColumn("completion_token_expires_on").AsDateTime().Nullable();
        }
    }
}
