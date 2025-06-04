using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20250529124100)]
    public class M20250529124100 : OneWayMigration
    {
        public override void Up()
        {
            // ToDo: AS - uncomment 

            //if (!Schema.Table("Frwk_EntityConfigs").Column("InheritedFromId").Exists())
            //    Alter.Table("Frwk_EntityConfigs").AddForeignKeyColumn("InheritedFromId", "Frwk_EntityConfigs").Nullable();

            //if (!Schema.Table("Frwk_EntityConfigs").Column("IdColumn").Exists())
            //    Alter.Table("Frwk_EntityConfigs").AddColumn("IdColumn").AsString(255).Nullable(); // ToDo: AS - Check max column name lenght

            //if (!Schema.Table("Frwk_EntityConfigs").Column("CreatedInDb").Exists())
            //    Alter.Table("Frwk_EntityConfigs").AddColumn("CreatedInDb").AsBoolean().Nullable();

            //IfDatabase("PostgreSql")
            //    .Execute.Sql("update \"Frwk_EntityConfigs\" set \"CreatedInDb\" = true");
            //IfDatabase("SqlServer")
            //    .Execute.Sql("update Frwk_EntityConfigs set CreatedInDb = 1");

            //if (!Schema.Table("Frwk_EntityProperties").Column("InheritedFromId").Exists())
            //    Alter.Table("Frwk_EntityProperties").AddForeignKeyColumn("InheritedFromId", "Frwk_EntityProperties").Nullable();

            //if (!Schema.Table("Frwk_EntityProperties").Column("ColumnName").Exists())
            //    Alter.Table("Frwk_EntityProperties").AddColumn("ColumnName").AsString(255).Nullable(); // ToDo: AS - Check max column name lenght

            //if (!Schema.Table("Frwk_EntityProperties").Column("CreatedInDb").Exists())
            //    Alter.Table("Frwk_EntityProperties").AddColumn("CreatedInDb").AsBoolean().Nullable();

            //IfDatabase("PostgreSql")
            //    .Execute.Sql("update \"Frwk_EntityProperties\" set \"CreatedInDb\" = true");
            //IfDatabase("SqlServer")
            //    .Execute.Sql("update Frwk_EntityProperties set CreatedInDb = 1");

            //IfDatabase("PostgreSql")
            //    .Execute.Sql("update \"Frwk_EntityProperties\" set \"DataType\" = 'file', \"EntityType\" = null where \"EntityType\" = 'Shesha.Framework.StoredFile'");
            //IfDatabase("SqlServer")
            //    .Execute.Sql("update Frwk_EntityProperties set DataType = 'file', EntityType = null where EntityType = 'Shesha.Framework.StoredFile'");

        }
    }
}