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

                // Insert initial data
                Insert.IntoTable("Core_DummyTable")
                    .Row(new
                    {
                        Id = System.Guid.NewGuid(),
                        City = "Tokyo",
                        Country = "Japan",
                        Population = 37.4m,
                        Area = 2194,
                        FunFact = "World's largest metro area",
                        CreationTime = System.DateTime.UtcNow,
                        IsDeleted = false,
                        TenantId = (int?)null
                    })
                    .Row(new
                    {
                        Id = System.Guid.NewGuid(),
                        City = "Cape Town",
                        Country = "South Africa",
                        Population = 4.7m,
                        Area = 2455,
                        FunFact = "Home to the unique flat-topped Table Mountain",
                        CreationTime = System.DateTime.UtcNow,
                        IsDeleted = false,
                        TenantId = (int?)null
                    })
                    .Row(new
                    {
                        Id = System.Guid.NewGuid(),
                        City = "Reykjavik",
                        Country = "Iceland",
                        Population = 0.13m,
                        Area = 273,
                        FunFact = "World's northernmost capital",
                        CreationTime = System.DateTime.UtcNow,
                        IsDeleted = false,
                        TenantId = (int?)null
                    })
                    .Row(new
                    {
                        Id = System.Guid.NewGuid(),
                        City = "Mexico City",
                        Country = "Mexico",
                        Population = 22.1m,
                        Area = 1485,
                        FunFact = "Sinks several centimeters each year",
                        CreationTime = System.DateTime.UtcNow,
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