using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations.Framework
{
    [Migration(20220328063901)]
    public class M20220328063901 : Migration
    {
        public override void Up()
        {
            Execute.Sql(@"
                        CREATE INDEX Idx_AbpNotifications_EntityId ON AbpNotifications(EntityId);
                        GO
                        CREATE INDEX Idx_AbpTenantNotifications_EntityId ON AbpTenantNotifications(EntityId);
                        GO            
            ");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }

    }
}