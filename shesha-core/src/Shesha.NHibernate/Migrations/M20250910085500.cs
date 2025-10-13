using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20250910085500)]
    public class M20250910085500: OneWayMigration
    {
        public override void Up()
        {
            Create.Table("Frwk_StoredFileVersionDownloads")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithForeignKeyColumn("FileVersionId", "Frwk_StoredFileVersions").NotNullable();
        }
    }
}
