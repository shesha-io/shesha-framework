using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240528095599)]
    public class M20240528095599 : OneWayMigration
    {
        public override void Up()
        {
			IfDatabase("SqlServer").Execute.Sql(@"with data as (
select 
	Id,
	EntityConfigId,
	ParentPropertyId,
	Name,
	CreationTime,
	ROW_NUMBER() over (partition by EntityConfigId, ParentPropertyId, Name order by CreationTime) rowNo
from 
	Frwk_EntityProperties 
where
	IsDeleted = 0
)
update 
	Frwk_EntityProperties
set
	IsDeleted = 1
where
	id in (
		select 
			Id 
		from 
			data
		where
			rowNo > 1
	)");

            IfDatabase("SqlServer").Execute.Sql(@"create unique index uq_Frwk_EntityProperties_Path on Frwk_EntityProperties(EntityConfigId, ParentPropertyId, Name) where IsDeleted=0");

            IfDatabase("PostgreSql").Execute.Sql(@"with data as (
select 
	""Id"",
	""EntityConfigId"",
	""ParentPropertyId"",
	""Name"",
	""CreationTime"",
	ROW_NUMBER() over (partition by ""EntityConfigId"", ""ParentPropertyId"", ""Name"" order by ""CreationTime"") row_no
from 
	""Frwk_EntityProperties"" 
where
	""IsDeleted"" = false
)
update 
	""Frwk_EntityProperties""
set
	""IsDeleted"" = false
where
	""Id"" in (
		select 
			""Id"" 
		from 
			data
		where
			row_no > 1
	)");

            IfDatabase("PostgreSql").Execute.Sql(@"create unique index ""uq_Frwk_EntityProperties_Path"" on ""Frwk_EntityProperties""(""EntityConfigId"", ""ParentPropertyId"", ""Name"") where (""IsDeleted""=false)");
        }
    }
}
