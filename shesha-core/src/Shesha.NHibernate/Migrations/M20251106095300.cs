using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20251106095300)]
    public class M20251106095300 : OneWayMigration
    {
        private void MoveFks(string oldTable, string newTable)
        {
            this.Shesha().MoveForeignKeys(oldTable, null, "Id", newTable, "frwk", "id");
        }

        public override void Up()
        {
            Create.Table("stored_file_version_downloads").InSchema("frwk")
                .WithIdAsGuid("id")
                .WithFullAuditColumns(SnakeCaseDbObjectNames.Instance, true)
                .WithTenantIdAsNullable(SnakeCaseDbObjectNames.Instance).Indexed()
                .WithColumn("file_version_id").AsGuid().Nullable().Indexed();

            if (Schema.Table("Frwk_StoredFileVersionDownloads").Exists())
            {
                Execute.Sql(@"insert into frwk.stored_file_version_downloads
                                (id
                                ,creation_time
                                ,creator_user_id
                                ,last_modification_time
                                ,last_modifier_user_id
                                ,is_deleted
                                ,deletion_time
                                ,deleter_user_id
                                ,tenant_id
                                ,file_version_id)
                            select
                                ""Id""
                                ,""CreationTime""
                                ,""CreatorUserId""
                                ,""LastModificationTime""
                                ,""LastModifierUserId""
                                ,""IsDeleted""
                                ,""DeletionTime""
                                ,""DeleterUserId""
                                ,NULL  
                                ,""FileVersionId""
                            from ""Frwk_StoredFileVersionDownloads""
                            ");

                MoveFks("Frwk_StoredFileVersionDownloads", "stored_file_version_downloads");

                Delete.Table("Frwk_StoredFileVersionDownloads");
            }
            else
            {
                Create.ForeignKey("fk_stored_file_version_downloads_file_version_id")
                    .FromTable("stored_file_version_downloads").InSchema("frwk").ForeignColumn("file_version_id")
                    .ToTable("stored_file_versions").InSchema("frwk").PrimaryColumn("id");
            }

        }
    }
}
