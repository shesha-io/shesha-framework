using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20230322134800), MsSqlOnly]
    public class M20230322134800 : Migration
    {
        public override void Up()
        {
            Create.Table("Core_Sites")
               .WithIdAsGuid()
               .WithFullAuditColumns()
               .WithTenantIdAsNullable()
               .WithColumn("Name").AsString().Nullable()
               .WithColumn("ShortName").AsString().Nullable()
               .WithColumn("Description").AsString().Nullable()
               .WithColumn("Comments").AsString().Nullable()
               .WithColumn("SiteTypeLkp").AsInt64().Nullable()
               .WithForeignKeyColumn("PartOfId", "Core_Sites")
               .WithForeignKeyColumn("AddressId", "Core_Addresses")
               .WithForeignKeyColumn("PrimaryContactId", "Core_Persons")
               .WithForeignKeyColumn("OrganisationId", "Core_Organisations")
               .WithColumn("Latitude").AsDecimal().Nullable()
               .WithColumn("Longitude").AsDecimal().Nullable()
               .WithColumn("Altitude").AsDecimal().Nullable()
               .WithColumn("Area").AsInt32().Nullable()
               .WithColumn("Boundary").AsCustom("geometry").Nullable();

            Create.Table("Core_Accounts")
               .WithIdAsGuid()
               .WithFullAuditColumns()
               .WithTenantIdAsNullable()
               .WithColumn("Name").AsString().Nullable()
               .WithForeignKeyColumn("PrimaryContactId", "Core_Persons")
               .WithForeignKeyColumn("ParentId", "Core_Accounts")
               .WithForeignKeyColumn("PrimarySiteId", "Core_Sites");

            if (!Schema.Table("Core_Persons").Column("PrimarySiteId").Exists())
            {
                Alter.Table("Core_Persons")
                .AddForeignKeyColumn("PrimarySiteId", "Core_Sites");
            }
                if (!Schema.Table("Core_Persons").Column("PrimaryAccountId").Exists())
                {
                Alter.Table("Core_Persons")
                   .AddForeignKeyColumn("PrimaryAccountId", "Core_Accounts");

            }

                if (!Schema.Table("Core_Persons").Column("PrimaryOrganisationId").Exists())
            {
                Alter.Table("Core_Persons")
                   .AddForeignKeyColumn("PrimaryOrganisationId", "Core_Organisations");
            }

            this.Shesha().ReferenceListCreate("Shesha.Core", "SiteType");

        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
