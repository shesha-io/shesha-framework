using FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20220901161500), MsSqlOnly]
    public class M20220901161500 : AutoReversingMigration
    {
        public override void Up()
        {
            Create.Column("IsLast").OnTable("Frwk_ConfigurationItems").AsBoolean().NotNullable().SetExistingRowsTo(1);
        }
    }
}
