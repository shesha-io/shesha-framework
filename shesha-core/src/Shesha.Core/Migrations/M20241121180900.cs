using FluentMigrator;
using NUglify;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20241121180900)]
    public class M20241121180900 : Migration
    {
        public override void Up()
        {
            Create.Table("Core_NotificationGatewayConfigs")
                   .WithIdAsGuid()
                   .WithForeignKeyColumn("Core_PartOfId", "Core_NotificationChannelConfigs")
                   .WithColumn("Core_GatewayTypeName").AsString(255).Nullable();

            Create.ForeignKey("FK_Core_NotificationGatewayConfigs_Frwk_ConfigurationItems_Id")
                  .FromTable("Core_NotificationGatewayConfigs")
                  .ForeignColumn("Id")
                  .ToTable("Frwk_ConfigurationItems")
                  .PrimaryColumn("Id");
        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
