using System.Collections.Generic;
using FluentMigrator;
using JetBrains.Annotations;
using Shesha.FluentMigrator;
using Shesha.Utilities;

namespace Shesha.Migrations
{
    /*/// <summary>
    /// Saved Filters sample of registration
    /// </summary>
    [Migration(20200707055500), UsedImplicitly]
    public class M20200707055500: Migration
    {
        public override void Up()
        {
            // Adds "All items", "Created by me", "Created by user A" stored filters to 2 data tables each
            
            this.RegisterStoredFilter(filterName: "All Items", hqlExpression: "2*2=4", orderIndex: 1) //omit orderIndex for alphabetical order
                .OnDataTables("SchoolApplications_Index", "DepartmentUsers_Index")
                .Execute();

            this.RegisterStoredFilter(filterName: "My Items", hqlExpression: "ent.CreatorUserId={userId}", orderIndex: 2)
                .OnDataTables("SchoolApplications_Index", "DepartmentUsers_Index")
                .Execute();

            this.RegisterStoredFilter(filterName: "Created by A", hqlExpression: "ent.CreatorUserId=11334", orderIndex: 3)
                .OnDataTables("SchoolApplications_Index", "DepartmentUsers_Index")

                // This is only necessary if you'd like to delete the filter in Down() method or for code filters
                .WithExplicitId("CCDF3181-81C8-4EF5-B5F4-A08426804B94".ToGuid())

                // Custom visibility can be added per filter. If we omit it, the filter is visible to anyone
                // Note: ID must be provided instead of role name for now
                // .VisibleToRoles(("Gde", "System Administrator"), ("Gde", "School Administrator"), ("Gde", "Data Administrator"))

                .Execute();
        }

        public override void Down()
        {
            Execute.Sql("delete Frwk_StoredFilterContainers where filterId in ('CCDF3181-81C8-4EF5-B5F4-A08426804B94')");
            Execute.Sql("delete Frwk_EntityVisibility where entityId in ('CCDF3181-81C8-4EF5-B5F4-A08426804B94')");
            Execute.Sql("delete Frwk_StoredFilterRelations filterId id in ('CCDF3181-81C8-4EF5-B5F4-A08426804B94')");
            Execute.Sql("delete frwk_storedFilters where id in ('CCDF3181-81C8-4EF5-B5F4-A08426804B94')");
        }
    }*/
}
