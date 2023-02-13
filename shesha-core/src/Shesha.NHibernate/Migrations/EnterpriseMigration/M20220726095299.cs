using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations.EnterpriseMigration
{
    [Migration(20220726095299)]
    public class M20220726095299 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            // Shesha.Domain.ConfigurationItems.ConfigurationItem
            Alter.Table("Frwk_ConfigurationItems")
                .AddColumn("ItemType").AsString(200).Nullable();

            // Shesha.Web.FormsDesigner.Domain.FormConfiguration
            Create.Table("Frwk_FormConfigurations")
                .WithIdAsGuid()
                .WithColumn("Markup").AsStringMax().Nullable()
                .WithColumn("ModelType").AsStringMax().Nullable()
                .WithColumn("Type").AsString(100).Nullable();

            // Shesha.Web.FormsDesigner.Domain.FormConfiguration
            Create.ForeignKey("FK_Frwk_FormConfigurations_Frwk_ConfigurationItems_Id")
                .FromTable("Frwk_FormConfigurations")
                .ForeignColumn("Id")
                .ToTable("Frwk_ConfigurationItems")
                .PrimaryColumn("Id");
        }
    }
}
