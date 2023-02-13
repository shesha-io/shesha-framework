using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations.Framework
{
    [Migration(20220209190600)]
    public class M20220209190600 : AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.Frwk_EntityPropertyValue
            Create.Table("Frwk_EntityPropertyValues")
                .WithIdAsGuid()
                .WithFullPowerChildEntityColumns()
                .WithColumn("Value").AsStringMax().Nullable();

            // Shesha.Domain.Frwk_EntityPropertyValue
            Alter.Table("Frwk_EntityPropertyValues")
                .AddForeignKeyColumn("EntityPropertyId", "Frwk_EntityProperties").NotNullable();
        }
    }
}
