using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20221227124399), MsSqlOnly]
    public class M20221227124399 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Column("ReferenceListName").OnTable("Frwk_EntityProperties").AsString(400).Nullable();

            Execute.Sql(
@"update 
	Frwk_EntityProperties 
set 
	ReferenceListName = ReferenceListNamespace + '.' + ReferenceListName 
where 
	ReferenceListName is not null 
	and ReferenceListName is not null
	and ReferenceListName not like ReferenceListNamespace + '.%'");

            Delete.Column("ReferenceListNamespace").FromTable("Frwk_EntityProperties");

            Create.Column("ReferenceListModule").OnTable("Frwk_EntityProperties").AsString(300).Nullable();
        }
    }
}
