using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20191210162400)]
    public class M20191210162400 : AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.EntityConfig
            Create.Table("Frwk_EntityConfigs")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("ClassName").AsString(500).Nullable()
                .WithColumn("DiscriminatorValue").AsString(255).Nullable()
                .WithColumn("FriendlyName").AsString(255).Nullable()
                .WithColumn("Namespace").AsString(500).Nullable()
                .WithColumn("TableName").AsString(255).Nullable()
                .WithColumn("TypeShortAlias").AsString(100).Nullable();

            // Shesha.Domain.Note
            Create.Table("Frwk_Notes")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("ImportanceLkp").AsInt32().Nullable()
                .WithColumn("NoteText").AsStringMax().Nullable()
                .WithColumn("Frwk_OwnerId").AsString(40).Nullable()
                .WithColumn("Frwk_OwnerType").AsString(100).Nullable()
                .WithForeignKeyColumn("ParentId", "Frwk_Notes")
                .WithColumn("SubTypeLkp").AsInt32().Nullable()
                .WithColumn("TypeLkp").AsInt32().Nullable();

            // Shesha.Domain.ReferenceList
            Create.Table("Frwk_ReferenceLists")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Description").AsString(300).Nullable()
                .WithColumn("HardLinkToApplication").AsBoolean()
                .WithColumn("Name").AsString(300).Nullable()
                .WithColumn("Namespace").AsString(300).Nullable()
                .WithColumn("NoSelectionValue").AsInt32().Nullable();

            // Shesha.Domain.ReferenceListItem
            Create.Table("Frwk_ReferenceListItems")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Description").AsStringMax().Nullable()
                .WithColumn("HardLinkToApplication").AsBoolean()
                .WithColumn("Item").AsString(300).Nullable()
                .WithColumn("ItemValue").AsInt32()
                .WithColumn("OrderIndex").AsInt32()
                .WithForeignKeyColumn("ParentId", "Frwk_ReferenceListItems")
                .WithForeignKeyColumn("ReferenceListId", "Frwk_ReferenceLists");

            // Shesha.Domain.StoredFile
            Create.Table("Frwk_StoredFiles")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("CategoryLkp").AsInt64().Nullable()
                .WithColumn("Description").AsStringMax().Nullable()
                .WithColumn("FileName").AsStringMax().Nullable()
                .WithColumn("FileType").AsStringMax().Nullable()
                .WithColumn("Folder").AsStringMax().Nullable()
                .WithColumn("IsVersionControlled").AsBoolean()
                .WithColumn("Frwk_OwnerId").AsString(40).Nullable()
                .WithColumn("Frwk_OwnerType").AsString(100).Nullable()
                .WithForeignKeyColumn("ParentFileId", "Frwk_StoredFiles")
                .WithColumn("SortOrder").AsInt32();

            // Shesha.Domain.StoredFileVersion
            Create.Table("Frwk_StoredFileVersions")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Description").AsStringMax().Nullable()
                .WithForeignKeyColumn("FileId", "Frwk_StoredFiles")
                .WithColumn("FileName").AsStringMax().Nullable()
                .WithColumn("FileSize").AsInt64()
                .WithColumn("FileType").AsStringMax().Nullable()
                .WithColumn("IsSigned").AsBoolean()
                .WithColumn("VersionNo").AsInt32();

            // Shesha.Domain.VersionedField
            Create.Table("Frwk_VersionedFields")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Name").AsStringMax().Nullable()
                .WithColumn("Frwk_OwnerId").AsString(40).Nullable()
                .WithColumn("Frwk_OwnerType").AsString(100).Nullable()
                .WithColumn("TrackVersions").AsBoolean();

            // Shesha.Domain.VersionedFieldVersion
            Create.Table("Frwk_VersionedFieldVersions")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Content").AsStringMax().Nullable()
                .WithForeignKeyColumn("FieldId", "Frwk_VersionedFields");
        }
    }
}