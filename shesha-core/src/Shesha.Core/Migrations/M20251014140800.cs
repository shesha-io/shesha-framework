using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20251014140800)]
    public class M20251014140800 : OneWayMigration
    {
        public override void Up()
        {
            if (!Schema.Table("Core_DummyCountryDatas").Exists())
            {
                Create.Table("Core_DummyCountryDatas")
                    .WithIdAsGuid()
                    .WithFullAuditColumns()
                    .WithColumn("City").AsString(100).NotNullable()
                    .WithColumn("Country").AsString(100).NotNullable()
                    .WithColumn("Population").AsDecimal(10, 2).Nullable()
                    .WithColumn("Area").AsDecimal(10, 2).Nullable()
                    .WithColumn("FunFact").AsString(1000).Nullable();

                // Insert sample data from the provided table
                Execute.Sql(@"
                    INSERT INTO Core_DummyCountryDatas (Id, CreationTime, City, Country, Population, Area, FunFact, IsDeleted) VALUES
                    (NEWID(), GETDATE(), 'Tokyo', 'Japan', 37.4, 2194, 'World''s largest metro area', 0),
                    (NEWID(), GETDATE(), 'Cape Town', 'South Africa', 4.7, 2455, 'Home to the unique flat-topped Table Mountain', 0),
                    (NEWID(), GETDATE(), 'Reykjavik', 'Iceland', 0.13, 273, 'World''s northernmost capital', 0),
                    (NEWID(), GETDATE(), 'Mexico City', 'Mexico', 22.1, 1485, 'Sinks several centimeters each year', 0)
                ");

                // PostgreSQL compatible version using gen_random_uuid()
                IfDatabase("PostgreSQL").Execute.Sql(@"
                    DELETE FROM ""Core_DummyCountryDatas"";
                    INSERT INTO ""Core_DummyCountryDatas"" (""Id"", ""CreationTime"", ""City"", ""Country"", ""Population"", ""Area"", ""FunFact"", ""IsDeleted"") VALUES
                    (gen_random_uuid(), NOW(), 'Tokyo', 'Japan', 37.4, 2194, 'World''s largest metro area', false),
                    (gen_random_uuid(), NOW(), 'Cape Town', 'South Africa', 4.7, 2455, 'Home to the unique flat-topped Table Mountain', false),
                    (gen_random_uuid(), NOW(), 'Reykjavik', 'Iceland', 0.13, 273, 'World''s northernmost capital', false),
                    (gen_random_uuid(), NOW(), 'Mexico City', 'Mexico', 22.1, 1485, 'Sinks several centimeters each year', false)
                ");
            }
        }
    }
}