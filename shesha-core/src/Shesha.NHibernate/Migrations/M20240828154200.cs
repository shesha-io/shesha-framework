using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20240828154200)]
    public class M20240828154200 : Migration
    {
        public override void Up()
        {
            Create.Table("Core_OtpConfigs")
                .WithIdAsGuid()
                .WithColumn("Core_SendTypeLkp").AsInt64().Nullable()
                .WithColumn("Core_RecipientType").AsString().Nullable()
                .WithColumn("Core_Lifetime").AsInt64().Nullable()
                .WithColumn("Core_ActionType").AsString().Nullable()
                .WithForeignKeyColumn("Core_EntityConfigId", "Frwk_EntityConfigs")
                .WithForeignKeyColumn("Core_NotificationTemplateId", "Core_NotificationTemplates");

            Create.ForeignKey("FK_Core_OtpConfigs_Frwk_ConfigurationItems_Id")
                 .FromTable("Core_OtpConfigs")
                 .ForeignColumn("Id")
                 .ToTable("Frwk_ConfigurationItems")
                 .PrimaryColumn("Id");

            Alter.Table("Frwk_OtpAuditItems")
                .AddColumn("ModuleName").AsString(100).Nullable()
                .AddColumn("SourceEntityId").AsGuid().Nullable();
        }

        public override void Down()
        {
           
        }
    }
}
