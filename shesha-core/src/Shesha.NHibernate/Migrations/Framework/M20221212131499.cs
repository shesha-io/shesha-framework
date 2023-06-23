using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20221212131499), MsSqlOnly]
    public class M20221212131499 : OneWayMigration
    {
        public override void Up()
        {
            Delete.Index("IX_Frwk_ReferenceLists_CreatorUserId").OnTable("Frwk_ReferenceLists");
            Delete.Index("IX_Frwk_ReferenceLists_DeleterUserId").OnTable("Frwk_ReferenceLists");
            Delete.Index("IX_Frwk_ReferenceLists_LastModifierUserId").OnTable("Frwk_ReferenceLists");
            Delete.Index("IX_Frwk_ReferenceLists_Namespace_Name_Tenant").OnTable("Frwk_ReferenceLists");
            Delete.Index("IX_Frwk_ReferenceLists_TenantId").OnTable("Frwk_ReferenceLists");

            Delete.ForeignKey("FK_Frwk_ReferenceLists_CreatorUserId_AbpUsers_Id").OnTable("Frwk_ReferenceLists");
            Delete.ForeignKey("FK_Frwk_ReferenceLists_DeleterUserId_AbpUsers_Id").OnTable("Frwk_ReferenceLists");
            Delete.ForeignKey("FK_Frwk_ReferenceLists_LastModifierUserId_AbpUsers_Id").OnTable("Frwk_ReferenceLists");
            Delete.ForeignKey("FK_Frwk_ReferenceLists_TenantId_AbpTenants_Id").OnTable("Frwk_ReferenceLists");

            Delete.Column("CreationTime").FromTable("Frwk_ReferenceLists");
            Delete.Column("CreatorUserId").FromTable("Frwk_ReferenceLists");
            Delete.Column("LastModificationTime").FromTable("Frwk_ReferenceLists");
            Delete.Column("LastModifierUserId").FromTable("Frwk_ReferenceLists");
            Delete.Column("IsDeleted").FromTable("Frwk_ReferenceLists");
            Delete.Column("DeletionTime").FromTable("Frwk_ReferenceLists");
            Delete.Column("DeleterUserId").FromTable("Frwk_ReferenceLists");
            Delete.Column("TenantId").FromTable("Frwk_ReferenceLists");
            Delete.Column("Description").FromTable("Frwk_ReferenceLists");
            Delete.Column("Name").FromTable("Frwk_ReferenceLists");
            Delete.Column("Namespace").FromTable("Frwk_ReferenceLists");
        }
    }
}
