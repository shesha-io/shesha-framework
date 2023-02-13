using System;
using FluentMigrator;

namespace Shesha.Web.FormsDesigner.Migrations
{
    [Migration(20210216192800)]
    public class M20210216192800: Migration
    {
        public override void Up()
        {
            Execute.Sql(
@"create unique index 
	uq_Frwk_Forms_Path
on 
	Frwk_Forms(Path) 
where IsDeleted=0 and Path is not null and Path <> ''");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
