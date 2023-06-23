using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Web.FormsDesigner.Migrations
{
    [Migration(20221229135599), MsSqlOnly]
    public class M20221229135599 : OneWayMigration
    {
        public override void Up()
        {
            // remove forms, they are were migrated earlier
            Execute.Sql("delete from Frwk_ConfigurableComponents where Frwk_Discriminator = 'Shesha.Framework.Form'");

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
	,(case when Id not in ('4D5FC26A-5100-4830-9A3E-532AC652A5E3', '95209CB6-3264-4140-939A-5AEBC62143B9', '9362F11A-EA9C-4152-9855-9516123467F7') then 1 else IsDeleted end) /*IsDeleted*/
	,DeletionTime
	,DeleterUserId
	,null /*TenantId*/
	,Description
	,(case Id when '4D5FC26A-5100-4830-9A3E-532AC652A5E3' then 'theme-configuration' 
			when '95209CB6-3264-4140-939A-5AEBC62143B9' then 'main-logo' 
			when '9362F11A-EA9C-4152-9855-9516123467F7' then 'sidebar-menu' 
		else cast(Id as varchar(40)) end) /*Name*/
	,1 /*VersionNo*/
	,3 /*VersionStatusLkp = Live*/
	,null /*BaseItemId*/
	,null /*CreatedByImportId*/
	,null /*module*/
	,'configurable-component'
	,1
	,Name /*label*/
	,Id
	,0
from
	Frwk_ConfigurableComponents
where
	Frwk_Discriminator = 'Shesha.Framework.ConfigurableComponent'
	and not exists (select 1 from Frwk_ConfigurationItems where Id = Frwk_ConfigurableComponents.Id)
");

            // Shesha.Web.FormsDesigner.Domain.FormConfiguration
            Create.ForeignKey("FK_Frwk_ConfigurableComponents_Frwk_ConfigurationItems_Id")
                .FromTable("Frwk_ConfigurableComponents")
                .ForeignColumn("Id")
                .ToTable("Frwk_ConfigurationItems")
                .PrimaryColumn("Id");

            Delete.ForeignKey("FK_Frwk_ConfigurableComponents_CreatorUserId_AbpUsers_Id").OnTable("Frwk_ConfigurableComponents");
            Delete.ForeignKey("FK_Frwk_ConfigurableComponents_DeleterUserId_AbpUsers_Id").OnTable("Frwk_ConfigurableComponents");
            Delete.ForeignKey("FK_Frwk_ConfigurableComponents_LastModifierUserId_AbpUsers_Id").OnTable("Frwk_ConfigurableComponents");

            Delete.Column("CreationTime").FromTable("Frwk_ConfigurableComponents");
            Delete.Column("CreatorUserId").FromTable("Frwk_ConfigurableComponents");
            Delete.Column("LastModificationTime").FromTable("Frwk_ConfigurableComponents");
            Delete.Column("LastModifierUserId").FromTable("Frwk_ConfigurableComponents");
            Delete.Column("IsDeleted").FromTable("Frwk_ConfigurableComponents");
            Delete.Column("DeletionTime").FromTable("Frwk_ConfigurableComponents");
            Delete.Column("DeleterUserId").FromTable("Frwk_ConfigurableComponents");
            Delete.Column("Description").FromTable("Frwk_ConfigurableComponents");
            Delete.Column("Name").FromTable("Frwk_ConfigurableComponents");
            Delete.Column("Path").FromTable("Frwk_ConfigurableComponents");
            Delete.Column("ModelType").FromTable("Frwk_ConfigurableComponents");
            Delete.Column("Type").FromTable("Frwk_ConfigurableComponents");
        }
    }
}
