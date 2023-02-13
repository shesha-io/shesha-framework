using FluentMigrator;
using System;

namespace Shesha.Web.FormsDesigner.Migrations
{
    [Migration(20220826100700)]
    public class M20220826100700 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            Execute.Sql(
@"update 
	Frwk_ConfigurableComponents 
set
	settings = replace(settings, 'selectedRow.Id', 'selectedRow.id')
where 
	settings like '%selectedRow.Id%'");
        }
    }
}
