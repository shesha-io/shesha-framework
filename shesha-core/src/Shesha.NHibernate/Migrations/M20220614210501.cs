using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations.Framework
{
    [Migration(20220614210501)]
    public class M20220614210501 : AutoReversingMigration
    {
        public override void Up()
        {
            Create.Table("Frwk_FrontEndApps")
                .WithIdAsGuid()
                .WithFullPowerEntityColumns()
                .WithColumn("Name").AsString(100).NotNullable()
                .WithColumn("Description").AsStringMax().Nullable();
        }
    }
}
