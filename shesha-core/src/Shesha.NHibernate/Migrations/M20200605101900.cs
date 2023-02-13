using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200605101900)]
    public class M20200605101900: AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.NotificationTemplate
            Create.Table("Core_NotificationTemplates")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("Body").AsStringMax().Nullable()
                .WithColumn("Name").AsString(300).Nullable()
                .WithColumn("Subject").AsString(300).Nullable();
        }
    }
}
