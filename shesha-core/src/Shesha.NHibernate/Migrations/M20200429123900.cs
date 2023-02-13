using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200429123900)]
    public class M20200429123900: AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.PersonRelationship
            Create.Table("Core_PersonRelationships")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("AtoBPersonRelationshipTypeLkp").AsInt32().Nullable()
                .WithForeignKeyColumn("PersonAId", "Core_Persons")
                .WithForeignKeyColumn("PersonBId", "Core_Persons")
                .WithColumn("ValidFromDate").AsDateTime().Nullable()
                .WithColumn("ValidToDate").AsDateTime().Nullable()
                .WithDiscriminator();
        }
    }
}
