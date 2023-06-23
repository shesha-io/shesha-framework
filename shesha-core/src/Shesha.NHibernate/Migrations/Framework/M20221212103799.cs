using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations.Framework
{
    [Migration(20221212103799), MsSqlOnly]
    public class M20221212103799 : OneWayMigration
    {
        public override void Up()
        {
            // extend model of Frwk_ConfigurationItems: add namespace property for backward compatibility
            Create.Column("Namespace").OnTable("Frwk_ConfigurationItems").AsString(300).Nullable();

            // extend unique index to include namespace
            Execute.Sql("drop index Frwk_ConfigurationItems.uq_Frwk_ConfigurationItems_Versioning");
            Execute.Sql(
@"create unique index 
	uq_Frwk_ConfigurationItems_Versioning 
on 
	Frwk_ConfigurationItems(Name, Namespace, ModuleId, ItemType, VersionNo)
where 
	IsDeleted = 0");
            
            Execute.Sql("drop index Frwk_ConfigurationItems.uq_Frwk_ConfigurationItems_LiveVersion");
            Execute.Sql("create unique index uq_Frwk_ConfigurationItems_LiveVersion on Frwk_ConfigurationItems(Name, Namespace, ModuleId, TenantId) where IsDeleted=0 and VersionStatusLkp = 3");

            // flow referencelist data to Frwk_ConfigurationItems
            Execute.Sql(
@"INSERT INTO Frwk_ConfigurationItems
           (Id
           ,CreationTime
           ,CreatorUserId
           ,LastModificationTime
           ,LastModifierUserId
           ,IsDeleted
           ,DeletionTime
           ,DeleterUserId
           ,TenantId
           ,Description
           ,Name
		   ,Namespace
           ,VersionNo
           ,VersionStatusLkp
           ,BaseItemId
           ,CreatedByImportId
           ,ModuleId
           ,ItemType
           ,IsLast
           ,Label
           ,OriginId
           ,Suppress)
select
	Id
	,CreationTime
	,CreatorUserId
	,LastModificationTime
	,LastModifierUserId
	,IsDeleted
	,DeletionTime
	,DeleterUserId
	,TenantId
	,Description
	,Name
	,Namespace
	,1 /*VersionNo*/
	,3 /*VersionStatusLkp = Live*/
	,null /*BaseItemId*/
	,null /*CreatedByImportId*/
	,null /*module*/
	,'reference-list'
	,1
	,null /*label*/
	,Id
	,0
from
	Frwk_ReferenceLists
where
	not exists (select 1 from Frwk_ConfigurationItems where Id = Frwk_ReferenceLists.Id)");
        }
    }
}
