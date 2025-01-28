using FluentMigrator;

namespace Shesha.FluentMigrator.ReferenceLists
{
    public static class MigratorRefListExtensions
    {
        public static void RemoveNamespaceFromRefList(Migration migration, string @namespace, string name, string moduleName)
        {
			migration.Execute.Sql($@"update
	""Frwk_ReferenceLists""
set
	""Namespace"" = '{@namespace}'
where
	""Id"" in (
		select
			ci.""Id""
		from 
			""Frwk_ReferenceLists"" rl
			inner join ""Frwk_ConfigurationItems"" ci on ci.""Id"" = rl.""Id""
			inner join ""Frwk_Modules"" m on m.""Id"" = ci.""ModuleId""
		where
			rl.""Namespace"" is null
			and upper(ci.""Name"") = upper('{@namespace}.{name}')
			and upper(m.""Name"") = upper('{moduleName}')	
			and not exists (
				select 
					1 
				from 
					""Frwk_ReferenceLists"" rl2
					inner join ""Frwk_ConfigurationItems"" ci2 on ci2.""Id"" = rl2.""Id""
					inner join ""Frwk_Modules"" m2 on m2.""Id"" = ci2.""ModuleId""
				where
					upper(rl2.""Namespace"") = upper('{@namespace}')
					and upper(ci2.""Name"") = upper('{@namespace}.{name}')
					and upper(m2.""Name"") = upper('{moduleName}')
			)
	)");
            // NOTE: works on both MSSql and PostgreSql
            migration.Execute.Sql($@"update
	""Frwk_ConfigurationItems""
set
	""Name"" = '{name}'
where
	""Id"" in (
		select
			ci.""Id""
		from 
			""Frwk_ReferenceLists"" rl
			inner join ""Frwk_ConfigurationItems"" ci on ci.""Id"" = rl.""Id""
			inner join ""Frwk_Modules"" m on m.""Id"" = ci.""ModuleId""
		where
			upper(rl.""Namespace"") = upper('{@namespace}')
			and upper(ci.""Name"") = upper('{@namespace}.{name}')
			and upper(m.""Name"") = upper('{moduleName}')	
			and not exists (
				select 
					1 
				from 
					""Frwk_ReferenceLists"" rl2
					inner join ""Frwk_ConfigurationItems"" ci2 on ci2.""Id"" = rl2.""Id""
					inner join ""Frwk_Modules"" m2 on m2.""Id"" = ci2.""ModuleId""
				where
					upper(ci2.""Name"") = upper('{name}')
					and upper(m2.""Name"") = upper('{moduleName}')
			)
	)");

            // NOTE: works on both MSSql and PostgreSql
            migration.Execute.Sql($@"update
	""Frwk_ReferenceLists""
set
	""Namespace"" = null
where
	""Id"" in (
		select
			ci.""Id""
		from 
			""Frwk_ReferenceLists"" rl
			inner join ""Frwk_ConfigurationItems"" ci on ci.""Id"" = rl.""Id""
			inner join ""Frwk_Modules"" m on m.""Id"" = ci.""ModuleId""
		where
			upper(rl.""Namespace"") = upper('{@namespace}')
			and upper(ci.""Name"") = upper('{name}')
			and upper(m.""Name"") = upper('{moduleName}')	
	)");

            migration.Execute.Sql($@"update
	""Frwk_FormConfigurations"" 
set
	""Markup"" = replace(""Markup"", '""referenceListId"":{{""name"":""{@namespace}.{name}""', '""referenceListId"":{{""name"":""{name}""')
where
	""Markup"" like '%""referenceListId"":{{""name"":""{@namespace}.{name}""%'");

            migration.Execute.Sql($@"update
	""Frwk_FormConfigurations"" 
set
	""Markup"" = replace(""Markup"", '""referenceListId"":{{""module"":""{moduleName}"",""name"":""{@namespace}.{name}""', '""referenceListId"":{{""name"":""{name}""')
where
	""Markup"" like '%""referenceListId"":{{""module"":""{moduleName}"",""name"":""{@namespace}.{name}""%'");
        }
        
		public static void FixRefListNotLinkedToModule(Migration migration, string @namespace, string name, string moduleName)
        {
            migration.Execute.Sql($@"update 
	""Frwk_ConfigurationItems""
set
	""Name"" = replace(""Name"", '{@namespace}.', ''),
	""ModuleId"" = (select ""Id"" from ""Frwk_Modules"" where ""Name"" = '{moduleName}')
where
	""Id"" in (
		select
			ci.""Id""
		from 
			""Frwk_ReferenceLists"" rl
			inner join ""Frwk_ConfigurationItems"" ci on ci.""Id"" = rl.""Id""
		where
			ci.""Name"" = '{name}'
			and rl.""Namespace"" is null
			and ci.""ModuleId"" is null
			and not exists (
				select 
					1 
				from 
					""Frwk_ReferenceLists"" rl2
					inner join ""Frwk_ConfigurationItems"" ci2 on ci2.""Id"" = rl2.""Id""			
					inner join ""Frwk_Modules"" m2 on m2.""Id"" = ci2.""ModuleId""
				where
					ci2.""Name"" = replace(ci.""Name"", '{@namespace}.', '')
					and m2.""Name"" = '{moduleName}'
			)
	)");
        }
    }
}
