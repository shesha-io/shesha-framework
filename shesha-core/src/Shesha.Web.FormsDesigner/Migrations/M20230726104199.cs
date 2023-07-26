using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Web.FormsDesigner.Migrations
{
    [Migration(20230726104199)]
    public class M20230726104199 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("sqlserver").Execute.Sql(
@"update 
	Frwk_ConfigurationItems
set
	VersionStatusLkp = 3
where
	Id in (
		select
			ci.Id
		from
			Frwk_ConfigurationItems ci
			inner join Frwk_FormConfigurations fc on fc.Id = ci.Id
		where
			fc.IsTemplate = 1
			and ci.IsLast = 1
			and VersionStatusLkp <> 3
			and not exists (
				select 
					1
				from
					Frwk_ConfigurationItems ci2
					inner join Frwk_FormConfigurations fc2 on fc2.Id = ci2.Id
				where
					ci2.Name = ci.Name
					and ci2.Id <> ci.Id
					and VersionStatusLkp = 3
			)
	)");

            // Execute sql only on PostgreSql
            IfDatabase("PostgreSQL").Execute.Sql(
@"update 
	""Frwk_ConfigurationItems""
set
	""VersionStatusLkp"" = 3
where
	""Id"" in (
		select
			ci.""Id""
		from
			""Frwk_ConfigurationItems"" ci
			inner join ""Frwk_FormConfigurations"" fc on fc.""Id"" = ci.""Id""
		where
			fc.""IsTemplate"" = true
			and ci.""IsLast"" = true
			and ""VersionStatusLkp"" <> 3
			and not exists (
				select 
					1
				from
					""Frwk_ConfigurationItems"" ci2
					inner join ""Frwk_FormConfigurations"" fc2 on fc2.""Id"" = ci2.""Id""
				where
					ci2.""Name"" = ci.""Name""
					and ci2.""Id"" <> ci.""Id""
					and ci2.""VersionStatusLkp"" = 3
			)
	)");
        }
    }
}
