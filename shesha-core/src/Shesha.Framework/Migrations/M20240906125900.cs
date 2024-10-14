using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20240906125900)]
    public class M20240906125900 : OneWayMigration
    {
        public override void Up()
        {
			IfDatabase("SqlServer").Execute.Sql(@"
update fc set Markup = REPLACE(fc.Markup, 'addDeferredUpdateData', 'addDelayedUpdateData')
from Frwk_FormConfigurations fc
inner join Frwk_ConfigurationItems ci on ci.id = fc.id and ci.IsDeleted = 0 and ci.IsLast = 1
where fc.Markup like '%addDeferredUpdateData%'
	");
        }
    }
}
