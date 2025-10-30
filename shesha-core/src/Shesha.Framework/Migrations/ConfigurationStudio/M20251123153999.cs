using FluentMigrator;
using Microsoft.AspNetCore.Http.HttpResults;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20251123153999)]
    public class M20251123153999 : OneWayMigration
    {
        public override void Up()
        {
            Delete.ForeignKey("FK_Frwk_StoredFiles_ParentFileId_Frwk_StoredFiles_Id").OnTable("Frwk_StoredFiles");
            Delete.ForeignKey("FK_Frwk_StoredFileVersions_FileId_Frwk_StoredFiles_Id").OnTable("Frwk_StoredFileVersions");
            Delete.ForeignKey("FK_Frwk_VersionedFieldVersions_FieldId_Frwk_VersionedFields_Id").OnTable("Frwk_VersionedFieldVersions");
            Delete.ForeignKey("FK_frwk_application_startup_assemblies_application_startup_id_frwk_application_startups_id").OnTable("frwk_application_startup_assemblies");
            Delete.ForeignKey("FK_Core_ImportResults_ImportedFileId_Frwk_StoredFiles_Id").OnTable("Frwk_ImportResults");
            Delete.ForeignKey("FK_Core_ImportResults_LogFileId_Frwk_StoredFiles_Id").OnTable("Frwk_ImportResults");

            Create.ForeignKey("fk_stored_files_parent_file_id").FromTable("stored_files").InSchema("frwk").ForeignColumn("parent_file_id").ToTable("stored_files").InSchema("frwk").PrimaryColumn("id");

            Create.ForeignKey("fk_stored_file_versions_file_id").FromTable("stored_file_versions").InSchema("frwk").ForeignColumn("file_id").ToTable("stored_files").InSchema("frwk").PrimaryColumn("id");

            Create.ForeignKey("fk_versioned_field_versions_field_id").FromTable("versioned_field_versions").InSchema("frwk").ForeignColumn("field_id").ToTable("versioned_fields").InSchema("frwk").PrimaryColumn("id");

            Create.ForeignKey("fk_application_startup_assemblies_application_startup_id").FromTable("application_startup_assemblies").InSchema("frwk").ForeignColumn("application_startup_id").ToTable("application_startups").InSchema("frwk").PrimaryColumn("id");

            Create.ForeignKey("fk_import_results_imported_file_id").FromTable("import_results").InSchema("frwk").ForeignColumn("imported_file_id").ToTable("stored_files").InSchema("frwk").PrimaryColumn("id");

            Create.ForeignKey("fk_import_results_log_file_id").FromTable("import_results").InSchema("frwk").ForeignColumn("log_file_id").ToTable("stored_files").InSchema("frwk").PrimaryColumn("id");

            Create.ForeignKey("fk_import_results_application_startup_assembly_id").FromTable("import_results").InSchema("frwk").ForeignColumn("application_startup_assembly_id").ToTable("application_startup_assemblies").InSchema("frwk").PrimaryColumn("id");

            Create.ForeignKey("fk_user_registrations_usert_id").FromTable("user_registrations").InSchema("frwk").ForeignColumn("user_id").ToTable("AbpUsers").PrimaryColumn("Id");

            Create.Index("ix_frwk_user_registrations_user_name_or_email_address").OnTable("user_registrations").InSchema("frwk").OnColumn("user_name_or_email_address");

            IfDatabase("SqlServer").Execute.Sql("create unique index uq_frwk_name_owner_not_deleted on frwk.versioned_fields (name, frwk_owner_id, frwk_owner_type) where (is_deleted = 0)");
            IfDatabase("PostgreSql").Execute.Sql("create unique index uq_frwk_name_owner_not_deleted on frwk.versioned_fields (name, frwk_owner_id, frwk_owner_type) where (is_deleted = false)");
        }
    }
}
