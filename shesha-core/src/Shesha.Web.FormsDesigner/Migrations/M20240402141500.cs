using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Web.FormsDesigner.Migrations
{
    [Migration(20240402141500)]
    public class M20240402141500 : OneWayMigration
    {
        public override void Up()
        {

                IfDatabase("sqlserver").Execute.Sql(@"
DECLARE @a TABLE (id uniqueidentifier);
INSERT INTO @a 
select fc.id
	from Frwk_FormConfigurations fc
	inner join Frwk_ConfigurationItems cii on cii.id = fc.id and cii.IsLast = 1 and cii.IsDeleted = 0
	where fc.Markup like '%/api/dynamic/%'

DECLARE @ent TABLE (name nvarchar(max), ClassName nvarchar(max), formId uniqueidentifier, id nvarchar(1000), Processed bit);
with allEnt as (
	select 
	mm.Name,
	ec.ClassName,
	fc.Id as formId,
	mm.name + ec.ClassName + cast(fc.Id as nvarchar(100)) as id,
	0 as Processed
	from Frwk_EntityConfigs ec
		inner join Frwk_ConfigurationItems ci on ci.Id = ec.Id and ci.IsLast = 1 and ci.IsDeleted = 0
		inner join Frwk_Modules mm on mm.id = ci.ModuleId
		full outer join Frwk_FormConfigurations fc on 1 = 1
		inner join Frwk_ConfigurationItems cii on cii.Id = fc.Id and cii.IsLast = 1
		inner join @a aa on aa.id = fc.id
	where 
		fc.Markup like '%/api/dynamic/' + mm.Name + '/' + ec.ClassName + '/%'
		)
INSERT INTO @ent
select * from allEnt

Declare @Id nvarchar(1000);

While (Select Count(*) From @ent Where Processed = 0) > 0
Begin
    Select Top 1 @Id = Id From @ent Where Processed = 0

    update fc set 
		Markup = REPLACE(fc.Markup, '/api/dynamic/' + ent.Name + '/' + ent.ClassName + '/', '/api/dynamic/' + ent.Name + '/' + ent.ClassName + '/Crud/')
	from Frwk_FormConfigurations fc
	inner join @ent ent on fc.id = ent.formId and ent.id = @Id

    Update @ent Set Processed = 1 Where Id = @Id 
End

update fc set Markup = REPLACE(REPLACE(Markup, '/Crud/Crud/', '/Crud/'), 'Crud/Query', 'Crud/Get')
from Frwk_FormConfigurations fc
inner join Frwk_ConfigurationItems cii on cii.id = fc.id and cii.IsLast = 1 and cii.IsDeleted = 0
");

                // Execute sql only on PostgreSql
                IfDatabase("PostgreSQL").Execute.Sql(@"
CREATE TEMP TABLE ""aa"" (""Id"" uuid);
INSERT INTO ""aa""
select fc.""Id""
	from ""Frwk_FormConfigurations"" fc
	inner join ""Frwk_ConfigurationItems"" cii on cii.""Id"" = fc.""Id"" and cii.""IsLast"" and not cii.""IsDeleted""
	where fc.""Markup"" like '%/api/dynamic/%';

CREATE TEMP TABLE ""ent"" (""Name"" VARCHAR(10000), ""ClassName"" VARCHAR(10000), ""formId"" uuid, ""Id"" VARCHAR(10000), ""Processed"" bool);
with ""allEnt"" as (
	select 
	mm.""Name"",
	ec.""ClassName"",
	fc.""Id"" as ""formId"",
	mm.""Name"" || ec.""ClassName"" || fc.""Id"" as ""Id"",
	false as ""Processed""
	from ""Frwk_EntityConfigs"" ec
		inner join ""Frwk_ConfigurationItems"" ci on ci.""Id"" = ec.""Id"" and ci.""IsLast"" and not ci.""IsDeleted""
		inner join ""Frwk_Modules"" mm on mm.""Id"" = ci.""ModuleId""
		full outer join ""Frwk_FormConfigurations"" fc on 1 = 1
		inner join ""Frwk_ConfigurationItems"" cii on cii.""Id"" = fc.""Id"" and cii.""IsLast"" and not cii.""IsDeleted""
		inner join ""aa"" aa on aa.""Id"" = fc.""Id""
		where fc.""Markup"" like '%/api/dynamic/' || mm.""Name"" || '/' || ec.""ClassName"" || '/%'
)
INSERT INTO ""ent""
select * from ""allEnt"";

DO $$

Declare Id VARCHAR(10000);

Begin
While (Select Count(*) From ent Where ent.""Processed"" ) > 0 loop

    Select Id = ent.""Id"" From ""ent"" ent Where ent.""Processed""
	fetch first 1 rows only;

    update fc set 
		""Markup"" = REPLACE(fc.""Markup"", '/api/dynamic/' || ent.""Name"" + '/' || ent.""ClassName"" || '/', '/api/dynamic/' || ent.""Name"" + '/' || ent.""ClassName"" + '/Crud/')
	from ""Frwk_FormConfigurations"" fc
	inner join ""ent"" ent on fc.""Id"" = ent.""formId"" and ent.""Id"" = Id;

    Update ent Set ent.""Processed"" = true Where ent.""Id"" = Id;
	end loop;
End

$$;

update ""Frwk_FormConfigurations"" set ""Markup"" = REPLACE(REPLACE(""Markup"", '/Crud/Crud/', '/Crud/'), 'Crud/Query', 'Crud/Get')	
");
        }
    }
}
