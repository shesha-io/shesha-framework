using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shesha.Migrations.Framework
{
    [Migration(20211214095400)]
    public class M20211214095400 : AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.EntityProperty
            Create.Table("Frwk_EntityProperties")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("DataType").AsStringMax().Nullable()
                .WithColumn("Description").AsStringMax().Nullable()
                .WithColumn("EntityType").AsStringMax().Nullable()
                .WithColumn("Label").AsStringMax().Nullable()
                .WithColumn("Name").AsStringMax().Nullable()
                .WithColumn("ReferenceListName").AsStringMax().Nullable()
                .WithColumn("ReferenceListNamespace").AsStringMax().Nullable();


            // Shesha.Domain.EntityProperty
            Alter.Table("Frwk_EntityProperties")
                .AddForeignKeyColumn("EntityConfigId", "Frwk_EntityConfigs");
        }
    }
}
