using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20251106120000)]
    public class M20251106120000 : Migration
    {
        public override void Up()
        {
            if (!Schema.Table("Core_DummyTable").Exists())
            {
                Create.Table("Core_DummyTable")
                    .WithIdAsGuid()
                    .WithFullAuditColumns()
                    .WithTenantIdAsNullable()
                    .WithColumn("City").AsString(100).Nullable()
                    .WithColumn("Country").AsString(100).Nullable()
                    .WithColumn("Population").AsDecimal(18, 2).NotNullable()
                    .WithColumn("Area").AsInt32().NotNullable()
                    .WithColumn("FunFact").AsString(500).Nullable();

                // Insert initial data with deterministic IDs and timestamps for idempotent migration
                var seedTimestamp = new System.DateTime(2024, 11, 6, 12, 0, 0, System.DateTimeKind.Utc);

                Insert.IntoTable("Core_DummyTable")
                    .Row(new
                    {
                        Id = new System.Guid("A1B2C3D4-E5F6-7890-1234-567890ABCDEF"),
                        City = "Tokyo",
                        Country = "Japan",
                        Population = 37.4m,
                        Area = 2194,
                        FunFact = "World's largest metro area",
                        CreationTime = seedTimestamp,
                        IsDeleted = false,
                        TenantId = (int?)null
                    })
                    .Row(new
                    {
                        Id = new System.Guid("B2C3D4E5-F6A7-8901-2345-678901BCDEF0"),
                        City = "Cape Town",
                        Country = "South Africa",
                        Population = 4.7m,
                        Area = 2455,
                        FunFact = "Home to the unique flat-topped Table Mountain",
                        CreationTime = seedTimestamp,
                        IsDeleted = false,
                        TenantId = (int?)null
                    })
                    .Row(new
                    {
                        Id = new System.Guid("C3D4E5F6-A7B8-9012-3456-789012CDEF01"),
                        City = "Reykjavik",
                        Country = "Iceland",
                        Population = 0.13m,
                        Area = 273,
                        FunFact = "World's northernmost capital",
                        CreationTime = seedTimestamp,
                        IsDeleted = false,
                        TenantId = (int?)null
                    })
                    .Row(new
                    {
                        Id = new System.Guid("D4E5F6A7-B8C9-0123-4567-890123DEF012"),
                        City = "Mexico City",
                        Country = "Mexico",
                        Population = 22.1m,
                        Area = 1485,
                        FunFact = "Sinks several centimeters each year",
                        CreationTime = seedTimestamp,
                        IsDeleted = false,
                        TenantId = (int?)null
                    });
            }
        }

        public override void Down()
        {
            Delete.Table("Core_DummyTable");
        }
    }
}