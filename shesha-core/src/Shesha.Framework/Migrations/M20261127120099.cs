using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    /// <summary>
    /// Adds <c>frwk.otp_send_log_items</c>, the history of OTP sends per destination. The per-destination send limits used an
    /// in-memory cache, so each instance of the application counted sends separately and the limits multiplied with the
    /// number of instances
    /// </summary>
    /// <remarks>
    /// The releases/0.43 branch has the same table as <c>Frwk_OtpSendLogItems</c> (migration 20261125120099). A database upgraded from
    /// 0.43 has already applied that version, so this migration has its own version and drops the old table: it only holds
    /// the sends of the last hour or so, which the limits can do without
    /// </remarks>
    [Migration(20261127120099)]
    public class M20261127120099 : OneWayMigration
    {
        /// <summary>
        /// Creates the table and an index on the destination and send time
        /// </summary>
        public override void Up()
        {
            if (!Schema.Schema("frwk").Table("otp_send_log_items").Exists())
            {
                Create.Table("otp_send_log_items").InSchema("frwk")
                    .WithIdAsGuid("id")
                    .WithColumn("destination").AsString(300).NotNullable()
                    .WithColumn("sent_on_utc").AsDateTime().NotNullable();

                Create.Index("ix_otp_send_log_items_destination_sent_on_utc").OnTable("otp_send_log_items").InSchema("frwk")
                    .OnColumn("destination").Ascending()
                    .OnColumn("sent_on_utc").Ascending();
            }

            if (Schema.Table("Frwk_OtpSendLogItems").Exists())
                Delete.Table("Frwk_OtpSendLogItems");
        }
    }
}
