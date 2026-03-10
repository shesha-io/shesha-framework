using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20251031141699)]
    public class M20251031141699 : OneWayMigration
    {
        public override void Up()
        {
            this.ForceBootstrapper("EntityConfigsBootstrapper");

            IfDatabase("SqlServer").Execute.Sql(@"update 
	ci
set
	is_deleted = 1,
	deletion_time = getdate()
from 
	frwk.configuration_items ci
	inner join frwk.entity_configs ec on ec.id = ci.id
where 
	ci.is_deleted = 0
	and ec.namespace in ('Shesha.Domain.ConfigurationItems', 'Shesha.Web.FormsDesigner.Domain')");

            IfDatabase("PostgreSql").Execute.Sql(@"UPDATE 
	frwk.configuration_items ci
SET
	is_deleted = true,
	deletion_time = CURRENT_TIMESTAMP
FROM 
	frwk.entity_configs ec
WHERE 
	ci.is_deleted = false
	AND ec.namespace in ('Shesha.Domain.ConfigurationItems', 'Shesha.Web.FormsDesigner.Domain')
	AND ec.id = ci.id");
        }
    }
}
