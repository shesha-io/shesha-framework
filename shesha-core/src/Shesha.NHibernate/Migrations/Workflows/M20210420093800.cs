using System;
using FluentMigrator;

namespace Shesha.Migrations.Workflows
{
    [Migration(20210420093800)]
    public class M20210420093800: Migration
    {
        public override void Up()
        {
            Execute.Sql(
@"update 
	Core_WorkflowDefinitions
set
	IsDefault = 0
where
	Id in (
		select 
			d.Id
		from 
			Core_WorkflowDefinitions d
		where
			IsDefault = 1
			and exists (
				select 
					1 
				from 
					Core_WorkflowDefinitions new
				where
					new.CreationTime > d.CreationTime
					and new.Name = d.Name
					and new.IsDefault = 1
				)
	)");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
