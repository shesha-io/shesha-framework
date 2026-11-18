using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    /// <summary>
    /// Widens <c>Frwk_OtpAuditItems.RecipientId</c>. Email links store the Base64-encoded email address or username there,
    /// so any address longer than 30 characters overflowed the old 40-character column and the link was never sent.
    /// </summary>
    [Migration(20261117120099)]
    public class M20261117120099 : OneWayMigration
    {
        /// <summary>
        /// Widens <c>RecipientId</c> to 500 characters, enough for a Base64-encoded 254-character email address or username
        /// </summary>
        public override void Up()
        {
            Alter.Column("RecipientId").OnTable("Frwk_OtpAuditItems").AsString(500).Nullable();
        }
    }
}
