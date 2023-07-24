using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations.PostgreSqlMigrations
{
    /*
    /// <summary>
    /// This migration is developed for PostgreSql server only
    /// </summary>
    [Migration(20230613122300), MsSqlOnly]
    [PostgreSqlOnly]
    public class M20230613122300 : OneWayMigration
    {
        public override void Up()
        {
            Create.Table("_postgre_table")
                .WithColumn("id").AsGuid().PrimaryKey()
                .WithColumn("name").AsString(200)
                .WithDiscriminator()
                .WithFullAuditColumns();
        }
    }

    /// <summary>
    /// This migration is developed for MS Sql server only
    /// </summary>
    [Migration(20230613125000), MsSqlOnly]
    [MsSqlOnly]
    public class M20230613125000 : OneWayMigration
    {
        public override void Up()
        {
            Create.Table("_sql_table")
                .WithColumn("id").AsGuid().PrimaryKey()
                .WithColumn("name").AsString(200)
                .WithDiscriminator()
                .WithFullAuditColumns();
        }
    }

    /// <summary>
    /// This migration supports all server types
    /// </summary>
    [Migration(20230613125100), MsSqlOnly]
    public class M20230613125100 : OneWayMigration
    {
        public override void Up()
        {
            Create.Table("_Common_Table")
                .WithColumn("Id").AsGuid().PrimaryKey()
                .WithColumn("Name").AsString(200);

            Alter.Column("Name").OnTable("_Common_Table").AsString(300);

            // Execute sql only on MS Sql database
            IfDatabase("sqlserver").Execute.Sql("insert into _sql_table (id, name, CreationTime, IsDeleted, Frwk_Discriminator) values (newid(), 'test', getdate(), 0, '-')");

            // Execute sql only on PostgreSql
            IfDatabase("PostgreSQL").Execute.Sql("insert into _postgre_table (id, name, \"CreationTime\", \"IsDeleted\", \"Frwk_Discriminator\") values (uuid_generate_v4(), 'test', now(), false, '-')");
        }
    }
    */
}
