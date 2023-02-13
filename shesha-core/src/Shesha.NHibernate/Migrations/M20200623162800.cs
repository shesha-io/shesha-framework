using FluentMigrator;
using JetBrains.Annotations;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    /// <summary>
    /// Saved Filters
    /// </summary>
    [Migration(20200623162800), UsedImplicitly]
    public class M20200623162800: AutoReversingMigration
    {
        public override void Up()
        {
            // This model is used for both data table filters and the Descriptionreporting framework filters

            Create.Table("Frwk_StoredFilters")
                .WithDescription("Filters data model is used for both data table filters and the reporting framework filters")
                .WithIdAsGuid()

                // moved to Frwk_StoredFilterOwners // .WithColumn("DataTableId").AsString(255).Nullable().WithColumnDescription("when provided, the filter is only available for the given data table configuration")
                
                .WithColumn("Name").AsString(255).NotNullable().WithColumnDescription("user friendly name of the filter that end users see in the filter picker")
                .WithColumn("Namespace").AsString(255).Nullable().WithColumnDescription("only necessary for the report sub-filters. can be provided to limit output")
                .WithColumn("Description").AsStringMax().Nullable().WithColumnDescription("filter description can be provided here")
                .WithColumn("OrderIndex").AsInt32().Nullable().WithColumnDescription("items with `null` order index are shown in the filter list sorted alphabetically after showing filters with non-empty Order Index")

                .WithColumn("IsExclusive").AsBoolean().NotNullable().WithDefaultValue(false).WithColumnDescription("when true, this filter cannot be applied on top of other filter(s). This effects the following: 1) If a multi-check-list control is used for filter selection, selecting this filter is only if other filter is already checked (on the Data Table view or Report view), 2) Exclusive filters cannot be used as sub-filters of another filter")
                .WithColumn("IsPrivate").AsBoolean().NotNullable().WithDefaultValue(false).WithColumnDescription("true for filters that should only be visible to creator: 1) filter drafts created by admins or 2) filters created by end users. System filters are never private")
                // since ShaRole is on a higher level, added a many-to-many Frwk_StoredFilterContainers instead // .WithForeignKeyColumn("VisibilityWorkflowRoleId", "Core_ShaRoles").Nullable().WithColumnDescription("a workflow role that defines which users can see the filter. When null and Is Private=false, all users can see it.")
                
                .WithColumn("CustomFilterViewPath").AsString(512).Nullable().WithColumnDescription("this feature is actively used in the Reporting Framework. specifies a path to a view containing the filter UI")
                .WithColumn("CustomFilterFormId").AsGuid().Nullable().WithColumnDescription("allows us use form designer for creating filters UI. Can replace CustomFilterViewPath in many cases")

                .WithColumn("StoredFilterTypeLkp").AsInt32().NotNullable().WithColumnDescription("Column filter / HQL filter / ")

                .WithColumn("ColumnName").AsString(255).Nullable().WithColumnDescription("the name of the column that the filter is for")
                .WithColumn("ColumnFilterComparerTypeLkp").AsInt32().Nullable().WithColumnDescription("comparer: equals / start with / contains / ...")
                .WithColumn("ColumnDoNotApplyValue").AsBoolean().NotNullable().WithDefaultValue(false).WithColumnDescription("If true, the filter is not applied i.e. ColumnFilterValue is not used. This is required because in some cases we need to filter by empty string")
                .WithColumn("ColumnFilterValue").AsStringMax().Nullable().WithColumnDescription("value to filter by (for pre-defined filters only). Placeholders can be used")

                .WithColumn("HqlExpression").AsStringMax().Nullable().WithColumnDescription("HQL Query that defines the filter. Either built with JsonLogic or typed in manually")
                .WithColumn("JsonLogicExpression").AsStringMax().Nullable().WithColumnDescription("JsonLogic expression of the filter. It can be converted to HQL when needed")
                
                .WithFullPowerEntityColumns(indexCreatedByUserId: true /*for user filters quick search*/);

            Create.Table("Frwk_StoredFilterContainers").WithDescription("Each filter has at least one containing object such as datatable or report")
                .WithIdAsGuid()
                
                .WithForeignKeyColumn("FilterId", "Frwk_StoredFilters").NotNullable()

                .WithColumn("IsHidden").AsBoolean().NotNullable().WithDefaultValue(false).WithColumnDescription("When true, this filter is hidden from all users independent of Visibility settings")
                .WithColumn("IsDefaultFilter").AsBoolean().NotNullable().WithDefaultValue(false).WithColumnDescription("True for default filter of a container i.e. filter(s) that get immediately applied (selected in dropdown) when the data table or report is loaded. For non-exclusive filters, more than one can be selected as default")
                
                .WithFullPowerChildEntityColumns(indexCreatedByUserId: true /*for user filters quick search*/, ownerIdSize: 100 /*bigger ID size is required here because in some cases we link filters to containing data tables that are not entities and identified by a data table ID string*/);

            //todo: add Where (for deletion)
            Create.UniqueConstraint("uq_Frwk_StoredFilterContainers_container_filter")
                .OnTable("Frwk_StoredFilterContainers").Columns("Frwk_OwnerId", "FilterId");


            Create.Table("Frwk_EntityVisibility").WithDescription("Defines user group(s) (Person/ShaRole/DistributionList/...) that can see the filter. No record is for making a filter invisible to everyone")
                .WithIdAsGuid()
                
                .WithColumn("EntityAccessLkp").AsInt32().NotNullable().WithColumnDescription("Granted Access")

                .WithFullPowerManyToManyColumns();

            // todo: find a way to add where clause on IsDeleted=0 with Fluent.NHibernate
            //Create.UniqueConstraint("uq_Frwk_EntityVisibility_entity_GrantedToEntity")
            //    .OnTable("Frwk_EntityVisibility").Columns("EntityId", "EntityType", "GrantedToEntityId", "GrantedToEntityType");



            /* // Removed because this is to be stored in user settings or even the datatable state, when the state is implemented
             Create.Table("Frwk_StoredFilterUserOverrides").WithDescription("sub-filters. This may not be necessary because JsonLogic HQL expression may cover this. Can be used if we need to reuse parts of complex filters")
                .WithIdAsGuid()

                .WithForeignKeyColumn("FilterId", "Frwk_StoredFilters")
                .WithColumn("UserId").AsInt64().WithColumnDescription("User who specified settings for the filter")

                .WithColumn("IsHidden").AsBoolean().WithColumnDescription("When user clicks X, the filter gets hidden")
                
                .WithFullPowerColumns();
            Create.UniqueConstraint("uq_Frwk_StoredFilterUserOverrides_filter_user")
                .OnTable("Frwk_StoredFilterUserOverrides").Columns("UserId", "FilterId");
            */

            // Only used for composite saved filters (such as a saved advanced filter) or reusable subfilters
            Create.Table("Frwk_StoredFilterRelations").WithDescription("sub-filters. This may not be necessary because JsonLogic HQL expression may cover this. Can be used if we need to reuse parts of complex filters")
                .WithIdAsGuid()

                .WithForeignKeyColumn("FilterId", "Frwk_StoredFilters").NotNullable() // index is not required because of uq_Frwk_StoredFilterRelations_filter_subfilter

                .WithForeignKeyColumn("SubFilterId", "Frwk_StoredFilters").NotNullable()

                .WithColumn("JoinOperatorLkp").AsInt32().NotNullable().WithColumnDescription("Filter join operator (AND / OR). The operator is put between current and next subfilter of the same owning filter (by order index)")

                .WithColumn("OrderIndex").AsInt32().NotNullable().WithColumnDescription("Order Index of the sub-filter")
                
                .WithFullPowerEntityColumns();

            // todo: find a way to add where clause on IsDeleted=0 with Fluent.NHibernate
            //Create.UniqueConstraint("uq_Frwk_StoredFilterRelations_filter_subfilter")
            //    .OnTable("Frwk_StoredFilterRelations").Columns("FilterId", "SubFilterId, OrderIndex");

        }
    }
}
