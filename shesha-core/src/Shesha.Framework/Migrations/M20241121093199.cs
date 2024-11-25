using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20241121093199)]
    public class M20241121093199 : OneWayMigration
    {
        public override void Up()
        {
			// clean-up referencelists which were deleted by a wrong way
            Execute.Sql(@"delete from 
	""Frwk_ReferenceListItems""
where
	""ReferenceListId"" in (
		select 
			""Id"" 
		from 
			""Frwk_ReferenceLists""
		where
			not exists (
			select 
				1 
			from 
				""Frwk_ConfigurationItems"" ci
			where
				ci.""Id"" = ""Frwk_ReferenceLists"".""Id""
			)	
	)");

            Execute.Sql(@"delete from 
	""Frwk_ReferenceLists""
where
	not exists (
		select 
			1 
		from 
			""Frwk_ConfigurationItems"" ci
		where
			ci.""Id"" = ""Frwk_ReferenceLists"".""Id""
	)");

			// add missing foreign key
            Create.ForeignKey("FK_Frwk_ReferenceLists_Frwk_ConfigurationItems_Id")
                .FromTable("Frwk_ReferenceLists")
                .ForeignColumn("Id")
                .ToTable("Frwk_ConfigurationItems")
                .PrimaryColumn("Id");
        }
    }
}
