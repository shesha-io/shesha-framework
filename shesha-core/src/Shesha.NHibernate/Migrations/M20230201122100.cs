using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations.Framework
{
    [Migration(20230201122100), MsSqlOnly]
    public class M20230201122100 : Migration
    {
        public override void Up()
        {
            // switching to creating services through configurations
            Execute.Sql(@"update Frwk_EntityConfigs set GenerateAppService = 1");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }

    }
}