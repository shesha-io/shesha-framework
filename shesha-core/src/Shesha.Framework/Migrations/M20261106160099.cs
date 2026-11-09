using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    /// <summary>
    /// Single-use token for completing self-registration (additional registration information step)
    /// </summary>
    [Migration(20261106160099)]
    public class M20261106160099 : OneWayMigration
    {
        /// <summary>
        /// Adds the completion token hash and expiry columns to <c>Frwk_UserRegistration</c>
        /// </summary>
        public override void Up()
        {
            Alter.Table("Frwk_UserRegistration")
                .AddColumn("CompletionTokenHash").AsString(64).Nullable()
                .AddColumn("CompletionTokenExpiresOn").AsDateTime().Nullable();
        }
    }
}
