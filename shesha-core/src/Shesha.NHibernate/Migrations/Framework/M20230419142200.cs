using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20230419142200), MsSqlOnly]
    public class M20230419142200 : OneWayMigration
    {
        public override void Up()
        {
            Delete.Column("TemporaryOwnerProperty").FromTable("Frwk_StoredFiles");
        }
    }
}
