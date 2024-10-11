using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20240816095099)]
    public class M20240816095099 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"update
	SheshaFunctionalTests_TestAccounts
set
	CaptureFormId = null
where
	CaptureFormId in (
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
        }
    }
}
