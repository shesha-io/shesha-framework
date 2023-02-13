using System;
using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Web.FormsDesigner.Migrations
{
    [Migration(20210603092500)]
    public class M20210603092500: Migration
    {
        public override void Up()
        {
            // Shesha.Web.FormsDesigner.Domain.ConfigurableComponent
            Create.Table("Frwk_ConfigurableComponents")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("Description").AsStringMax().Nullable()
                .WithColumn("ModelType").AsStringMax().Nullable()
                .WithColumn("Name").AsString(100).Nullable()
                .WithColumn("Path").AsString(300).Nullable()
                .WithColumn("Settings").AsStringMax().Nullable()
                .WithDiscriminator();

            Execute.Sql(@"INSERT INTO Frwk_ConfigurableComponents
	(Id
	,CreationTime
	,CreatorUserId
	,LastModificationTime
	,LastModifierUserId
	,IsDeleted
	,DeletionTime
	,DeleterUserId
	,Description
	,ModelType
	,Name
	,Path
	,Settings
	,Frwk_Discriminator)
select
	Id
    ,CreationTime
    ,CreatorUserId
    ,LastModificationTime
    ,LastModifierUserId
    ,IsDeleted
    ,DeletionTime
    ,DeleterUserId
    ,Description
    ,ModelType
    ,Name
    ,Path
    ,Markup
    ,'Shesha.Framework.Form'
from
	Frwk_Forms
");

            Delete.Table("Frwk_Forms");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
