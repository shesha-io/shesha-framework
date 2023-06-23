using FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20221212093999), MsSqlOnly]
    public class M20221212093999 : AutoReversingMigration
    {
        public override void Up()
        {
            Create.Column("Color").OnTable("Frwk_ReferenceListItems").AsString(50).Nullable();
            Create.Column("Icon").OnTable("Frwk_ReferenceListItems").AsString(50).Nullable();
            Create.Column("ShortAlias").OnTable("Frwk_ReferenceListItems").AsString(50).Nullable();
        }
    }
}