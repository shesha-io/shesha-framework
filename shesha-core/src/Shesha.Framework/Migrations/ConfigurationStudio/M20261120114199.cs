using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.ConfigurationStudio
{
    [Migration(20261120114199)]
    public class M20261120114199 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("configuration_items").InSchema("frwk").AddColumn("is_overriden").AsBoolean().NotNullable().WithDefaultValue(false).SetExistingRowsTo(false);

            IfDatabase("SqlServer").Execute.Sql(@"update 
	frwk.configuration_items
set
	is_overriden = 1
where
	exists (
		select 
			1 
		from 
			frwk.configuration_items exp
		where
			exp.exposed_from_id = frwk.configuration_items.id
			and exp.is_deleted = 0
	)");
			IfDatabase("PostgreSql").Execute.Sql(@"update 
	frwk.configuration_items
set
	is_overriden = true
where
	exists (
		select 
			1 
		from 
			frwk.configuration_items exp
		where
			exp.exposed_from_id = frwk.configuration_items.id
			and exp.is_deleted = false
	)");
        }
    }
}
