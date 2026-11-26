using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    /// <summary>
    /// Adds <c>Frwk_OtpSendLogItems</c>, the history of OTP sends per destination. The per-destination send limits used an
    /// in-memory cache, so each instance of the application counted sends separately and the limits multiplied with the
    /// number of instances
    /// </summary>
    [Migration(20261125120099)]
    public class M20261125120099 : OneWayMigration
    {
        /// <summary>
        /// Creates the table and an index on the destination and send time
        /// </summary>
        public override void Up()
        {
            if (!Schema.Table("Frwk_OtpSendLogItems").Exists())
            {
                Create.Table("Frwk_OtpSendLogItems")
                    .WithIdAsGuid()
                    .WithColumn("Destination").AsString(300).NotNullable()
                    .WithColumn("SentOnUtc").AsDateTime().NotNullable();

                Create.Index("IX_Frwk_OtpSendLogItems_Destination_SentOnUtc").OnTable("Frwk_OtpSendLogItems")
                    .OnColumn("Destination").Ascending()
                    .OnColumn("SentOnUtc").Ascending();
            }
        }
    }
}
