using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    /// <summary>
    /// Widens <c>frwk.otp_audit_items.recipient_id</c>. Email links store the Base64-encoded email address or username there,
    /// so an address longer than about 75 characters overflowed the 100-character column and the link was never sent.
    /// </summary>
    [Migration(20261118120199)]
    public class M20261118120199 : OneWayMigration
    {
        /// <summary>
        /// Widens <c>recipient_id</c> to 500 characters, enough for a Base64-encoded 254-character email address or username
        /// </summary>
        public override void Up()
        {
            Alter.Column("recipient_id").OnTable("otp_audit_items").InSchema("frwk").AsString(500).Nullable();
        }
    }
}
