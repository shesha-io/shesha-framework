using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240530155700)]
    public class M20240530155700 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"
with data as (
select 
	ROW_NUMBER() over (partition by EntityConfigId, ParentPropertyId, Name order by CreationTime) rowNo,
	* 
from 
	Frwk_EntityProperties ep
where
	ep.IsDeleted = 1
	and ep.Name in (
		'CreatorUserId',
		'CreatorUser',
		'CreationTime',
		'IsDeleted',
		'DeleterUserId', 
		'DeleterUser', 
		'DeletionTime', 
		'LastModifierUserId', 
		'LastModifierUser', 
		'LastModificationTime', 
		'Id', 
		'TenantId'
	)
	and not exists (
		select 
			1 
		from 
			Frwk_EntityProperties dup 
		where
			dup.EntityConfigId = ep.EntityConfigId
			and coalesce(dup.ParentPropertyId, '00000000-0000-0000-0000-000000000000') = coalesce(ep.ParentPropertyId, '00000000-0000-0000-0000-000000000000')
			and dup.Name = ep.Name
			and dup.Id <> ep.Id
			and dup.IsDeleted = 0
	)
),
rdata as (
	select * from data where rowno = 1
)
update 
	Frwk_EntityProperties 
set 
	IsDeleted = 0
where 
	Id in (select Id from rdata)");

            IfDatabase("PostgreSql").Execute.Sql(@"
with data as (
select 
	ROW_NUMBER() over (partition by ""EntityConfigId"", ""ParentPropertyId"", ""Name"" order by ""CreationTime"") row_no,
	* 
from 
	""Frwk_EntityProperties"" ep
where
	ep.""IsDeleted"" = true
	and ep.""Name"" in (
		'CreatorUserId',
		'CreatorUser',
		'CreationTime',
		'IsDeleted',
		'DeleterUserId', 
		'DeleterUser', 
		'DeletionTime', 
		'LastModifierUserId', 
		'LastModifierUser', 
		'LastModificationTime', 
		'Id', 
		'TenantId'
	)
	and not exists (
		select 
			1 
		from 
			""Frwk_EntityProperties"" dup 
		where
			dup.""EntityConfigId"" = ep.""EntityConfigId""
			and coalesce(dup.""ParentPropertyId"", '00000000-0000-0000-0000-000000000000') = coalesce(ep.""ParentPropertyId"", '00000000-0000-0000-0000-000000000000')
			and dup.""Name"" = ep.""Name""
			and dup.""Id"" <> ep.""Id""
			and dup.""IsDeleted"" = false
	)
),
rdata as (
	select * from data where ""row_no"" = 1
)
update 
	""Frwk_EntityProperties"" 
set 
	""IsDeleted"" = false
where 
	""Id"" in (select ""Id"" from rdata)
");
        }
    }
}
