using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Web.FormsDesigner.Migrations
{
    [Migration(20240314202100)]
    public class M20240314202100 : OneWayMigration
    {
        public override void Up()
        {

                IfDatabase("sqlserver").Execute.Sql(@"
DECLARE @a TABLE (id uniqueidentifier);
INSERT INTO @a 
select fc.id
	from Frwk_FormConfigurations fc
	inner join Frwk_ConfigurationItems cii on cii.id = fc.id and cii.IsLast = 1
	where fc.Markup like '%/api/dynamic/%'

DECLARE @ent TABLE (name nvarchar(max), ClassName nvarchar(max), cou int);
with allEnt as (
	select 
	mm.Name,
	ec.ClassName,
	(select count(1)
		from Frwk_FormConfigurations fc
		where fc.Id in (select id from @a) and fc.Markup like '%/api/dynamic/' + mm.Name + '/' + ec.ClassName + '/%') as cou
	from Frwk_EntityConfigs ec
		inner join Frwk_ConfigurationItems ci on ci.Id = ec.Id and ci.IsLast = 1
		inner join Frwk_Modules mm on mm.id = ci.ModuleId
	where ec.IsDeleted = 0 and ec.SourceLkp = 1)
INSERT INTO @ent
select
	name, ClassName, cou
from allEnt
	where cou > 0

update fc set 
	Markup = REPLACE(fc.Markup, '/api/dynamic/' + ent.Name + '/' + ent.ClassName + '/', '/api/dynamic/' + ent.Name + '/' + ent.ClassName + '/Crud/')
from Frwk_FormConfigurations fc
left join @ent ent on 1=1
where 
fc.id in (select id from @a)
and fc.Markup like '%/api/dynamic/' + ent.Name + '/' + ent.ClassName + '/%'

update Frwk_FormConfigurations set Markup = REPLACE(Markup, 'Crud/Query', 'Crud/Get')
");

                // Execute sql only on PostgreSql
                IfDatabase("PostgreSQL").Execute.Sql(@"
CREATE TEMP TABLE ""aa"" (""Id"" uuid);
INSERT INTO ""aa""
select fc.""Id""
	from ""Frwk_FormConfigurations"" fc
	inner join ""Frwk_ConfigurationItems"" cii on cii.""Id"" = fc.""Id"" and cii.""IsLast""
	where fc.""Markup"" like '%/api/dynamic/%';

CREATE TEMP TABLE ""ent"" (""Name"" VARCHAR(10000), ""ClassName"" VARCHAR(10000), ""Cou"" int);
with ""allEnt"" as (
	select 
	mm.""Name"",
	ec.""ClassName"",
	(select count(1)
		from ""Frwk_FormConfigurations"" fc
		where fc.""Id"" in (select ""Id"" from ""aa"") and fc.""Markup"" like '%/api/dynamic/' || mm.""Name"" || '/' || ec.""ClassName"" || '/%') as ""Cou""
	from ""Frwk_EntityConfigs"" ec
		inner join ""Frwk_ConfigurationItems"" ci on ci.""Id"" = ec.""Id"" and ci.""IsLast""
		inner join ""Frwk_Modules"" mm on mm.""Id"" = ci.""ModuleId""
	where ec.""IsDeleted"" and ec.""SourceLkp"" = 1)
INSERT INTO ent
select
	""Name"", ""ClassName"", ""Cou""
from ""allEnt""
	where ""Cou"" > 0;

update ""Frwk_FormConfigurations"" set 
	""Markup"" = REPLACE(fc.""Markup"", '/api/dynamic/' || ent.""Name"" || '/' || ent.""ClassName"" || '/', '/api/dynamic/' || ent.""Name"" || '/' || ent.""ClassName"" || '/Crud/')
from ""Frwk_FormConfigurations"" fc
left join ""ent"" ent on 1=1
where 
""Frwk_FormConfigurations"".""Id"" in (select ""Id"" from ""aa"")
and ""Frwk_FormConfigurations"".""Markup"" like '%/api/dynamic/' || ent.""Name"" || '/' || ent.""ClassName"" || '/%';

update ""Frwk_FormConfigurations"" set ""Markup"" = REPLACE(""Markup"", 'Crud/Query', 'Crud/Get')
");
        }
    }
}
