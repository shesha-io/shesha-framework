using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20240816095699)]
    public class M20240816095699 : OneWayMigration
    {
        public override void Up()
        {
			IfDatabase("SqlServer").Execute.Sql(@"update
	Frwk_FormConfigurations 
set
	TemplateId = null
where 
	TemplateId in (
		select 
			ci.Id
		from
			Frwk_FormConfigurations fc
			inner join Frwk_ConfigurationItems ci on ci.Id = fc.Id
			left join Frwk_Modules m on m.Id = ci.ModuleId
		where
			ci.Name = 'form-view'
	)");
            IfDatabase("SqlServer").Execute.Sql(@"delete from
	Frwk_FormConfigurations
where
	id in (
		select
			ci.Id
		from 
			Frwk_FormConfigurations fc
			inner join Frwk_ConfigurationItems ci on ci.Id = fc.Id
			left join Frwk_Modules m on m.Id = ci.ModuleId
		where
			m.Name = 'Shesha'
			and (
				ci.Name in (' form-view', ' table-view') and fc.IsTemplate = 0
				or 
				ci.Name = 'form-view' and fc.IsTemplate = 1
			)
	)");
            IfDatabase("SqlServer").Execute.Sql(@"delete from 
	Frwk_ConfigurationItems
where
	ItemType = 'form'
	and not exists (
		select 
			1 
		from 
			Frwk_FormConfigurations fc
		where
			fc.Id = Frwk_ConfigurationItems.Id
	)");

			IfDatabase("PostgreSql").Execute.Sql(@"update
	""Frwk_FormConfigurations"" 
set
	""TemplateId"" = null
where 
	""TemplateId"" in (
		select 
			ci.""Id""
		from
			""Frwk_FormConfigurations"" fc
			inner join ""Frwk_ConfigurationItems"" ci on ci.""Id"" = fc.""Id""
			left join ""Frwk_Modules"" m on m.""Id"" = ci.""ModuleId""
		where
			ci.""Name"" = 'form-view'
	)");
            IfDatabase("PostgreSql").Execute.Sql(@"delete from
	""Frwk_FormConfigurations""
where
	""Id"" in (
		select
			ci.""Id""
		from 
			""Frwk_FormConfigurations"" fc
			inner join ""Frwk_ConfigurationItems"" ci on ci.""Id"" = fc.""Id""
			left join ""Frwk_Modules"" m on m.""Id"" = ci.""ModuleId""
		where
			m.""Name"" = 'Shesha'
			and (
				ci.""Name"" in (' form-view', ' table-view') and fc.""IsTemplate"" = false
				or 
				ci.""Name"" = 'form-view' and fc.""IsTemplate"" = true
			)
	)");
            IfDatabase("PostgreSql").Execute.Sql(@"delete from 
	""Frwk_ConfigurationItems""
where
	""ItemType"" = 'form'
	and not exists (
		select 
			1 
		from 
			""Frwk_FormConfigurations"" fc
		where
			fc.""Id"" = ""Frwk_ConfigurationItems"".""Id""
	)");
        }
    }
}
