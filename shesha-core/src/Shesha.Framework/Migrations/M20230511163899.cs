using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20230511163899), MsSqlOnly]
    public class M20230511163899 : OneWayMigration
    {
        public override void Up()
        {
			// restore properties defined in codeand removed by the bootstrapper to fix results of domain model refactoring
			// It's safe, unneeded properties will be automatically deleted
            Execute.Sql(@"update
	ec
set
	PropertiesMD5 = null
from 
	Frwk_EntityProperties ep
	inner join Frwk_EntityConfigs ec on ec.Id = ep.EntityConfigId
	inner join Frwk_ConfigurationItems ci on ci.Id = ec.Id
where
	ep.IsDeleted = 1
	and ep.DeleterUserId is null
	and ep.SourceLkp = 1 /*ApplicationCode*/");

            Execute.Sql(@"update
	ep
set
	IsDeleted = 0,
	DeletionTime = null
from 
	Frwk_EntityProperties ep
	inner join Frwk_EntityConfigs ec on ec.Id = ep.EntityConfigId
	inner join Frwk_ConfigurationItems ci on ci.Id = ec.Id
where
	ep.IsDeleted = 1
	and ep.DeleterUserId is null
	and ep.SourceLkp = 1 /*ApplicationCode*/");
        }
    }
}
