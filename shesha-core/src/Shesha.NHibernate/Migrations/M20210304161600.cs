using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20210304161600)]
    public class M20210304161600: AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.CheckList
            Create.Table("Core_CheckLists")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Description").AsStringMax().Nullable()
                .WithColumn("Name").AsString(255).Nullable();

            // Shesha.Domain.CheckListItem
            Create.Table("Core_CheckListItems")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("AllowAddComments").AsBoolean()
                .WithColumn("CommentsHeading").AsString(255).Nullable()
                .WithColumn("CommentsVisibilityExpression").AsStringMax().Nullable()
                .WithColumn("Description").AsStringMax().Nullable()
                .WithColumn("ItemTypeLkp").AsInt32()
                .WithColumn("Name").AsString(255).Nullable()
                .WithColumn("OrderIndex").AsInt32();

            // Shesha.Domain.CheckListItemSelection
            Create.Table("Core_CheckListItemSelections")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Comments").AsStringMax().Nullable()
                .WithColumn("EntityId").AsString(40).Nullable()
                .WithColumn("EntityType").AsString(100).Nullable()
                .WithColumn("Frwk_OwnerId").AsString(255).Nullable()
                .WithColumn("Frwk_OwnerType").AsString(100).Nullable()
                .WithColumn("SelectionLkp").AsInt32().Nullable();

            // Shesha.Domain.CheckListItem
            Alter.Table("Core_CheckListItems")
                .AddForeignKeyColumn("CheckListId", "Core_CheckLists", nullable: false)
                .AddForeignKeyColumn("ParentId", "Core_CheckListItems");

            // Shesha.Domain.CheckListItemSelection
            Alter.Table("Core_CheckListItemSelections")
                .AddForeignKeyColumn("CheckListItemId", "Core_CheckListItems", nullable: false);
        }
    }
}
