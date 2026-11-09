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
        public override void Up()
        {
            Alter.Table("Frwk_UserRegistration")
                .AddColumn("CompletionTokenHash").AsString(64).Nullable()
                .AddColumn("CompletionTokenExpiresOn").AsDateTime().Nullable();
        }
    }
}
