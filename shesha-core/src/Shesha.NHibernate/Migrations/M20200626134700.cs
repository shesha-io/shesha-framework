using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200626134700)]
    public class M20200626134700: AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.Order
            Create.Table("Core_Orders")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("Comment").AsStringMax().Nullable()
                .WithColumn("ConfirmedCollectionDate").AsDateTime().Nullable()
                .WithForeignKeyColumn("ReceiverId", "Core_Persons")
                .WithColumn("RefNo").AsString(100).Nullable()
                .WithColumn("RequestedCollectionDate").AsDateTime().Nullable()
                .WithForeignKeyColumn("RequesterId", "Core_Persons")
                .WithColumn("RequisitionNo").AsString(100).Nullable()
                .WithColumn("StatusLkp").AsInt32().Nullable()
                .WithDiscriminator();
        }
    }
}
