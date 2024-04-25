using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Web.FormsDesigner.Migrations
{
    [Migration(20240423163399)]
    public class M20240423163399 : OneWayMigration
    {
        public override void Up()
        {
                IfDatabase("sqlserver").Execute.Sql(@"
update fc set Markup = 
	REPLACE(
		REPLACE(
			REPLACE(
				REPLACE(
					REPLACE(fc.Markup
						, 'formContext.', 'pageContext.')
					, 'formContext)', 'pageContext)')
				, '""formContext""', '""pageContext""')
			, ' formContext ', ' formContext ')
		, 'formContext,', 'formContext,'
	)
from Frwk_FormConfigurations fc
inner join Frwk_ConfigurationItems ci on ci.id = fc .id and ci.IsLast = 1
where 
fc.Markup like '%formContext%'
");

        }
    }
}
