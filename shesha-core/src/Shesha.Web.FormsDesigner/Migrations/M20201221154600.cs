using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Web.FormsDesigner.Migrations
{
    [Migration(20201221154600)]
    public class M20201221154600: AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Web.FormsDesigner.Domain.Form
            Create.Table("Forms")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("Description").AsStringMax().Nullable()
                .WithColumn("Markup").AsStringMax().Nullable()
                .WithColumn("ModelType").AsStringMax().Nullable()
                .WithColumn("Name").AsString(100).Nullable()
                .WithColumn("Path").AsString(300).Nullable();
        }
    }
}
