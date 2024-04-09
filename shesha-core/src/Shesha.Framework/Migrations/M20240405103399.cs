using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240405103399)]
    public class M20240405103399 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"delete from 
	Frwk_EntityPropertyValues
where
	EntityPropertyId in (
		select
			ep.Id
		from
			Frwk_EntityConfigs ec
			inner join Frwk_EntityProperties ep on ep.EntityConfigId = ec.Id
		WHERE
			not exists (select 1 from Frwk_ConfigurationItems where Id = ec.Id)
	)");

            Execute.Sql(@"delete from 
	Frwk_EntityProperties
where
	EntityConfigId in (
		select
			Id
		from
			Frwk_EntityConfigs
		WHERE
			not exists (select 1 from Frwk_ConfigurationItems where Id = Frwk_EntityConfigs.Id)
	)");

            Execute.Sql(@"delete
from
	Frwk_EntityConfigs
WHERE
	not exists (select 1 from Frwk_ConfigurationItems where Id = Frwk_EntityConfigs.Id)");

            Create.ForeignKey("FK_Frwk_EntityConfigs_Frwk_ConfigurationItems_Id")
                .FromTable("Frwk_EntityConfigs")
                .ForeignColumn("Id")
                .ToTable("Frwk_ConfigurationItems")
                .PrimaryColumn("Id");
        }
    }
}
