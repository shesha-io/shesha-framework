using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20240902170200)]
    public class M20240902170200 : OneWayMigration
    {
        public override void Up()
        {
            Create.Table("Frwk_UserRegistration")
                .WithIdAsGuid()
                .WithTenantIdAsNullable()
                .WithColumn("GoToUrlAfterRegistration").AsString().Nullable()
                .WithColumn("AdditionalRegistrationInfoFormModule").AsString().Nullable()
                .WithColumn("AdditionalRegistrationInfoFormName").AsString().Nullable()
                .WithColumn("CreationTime").AsDateTime()
                .WithColumn("UserId").AsInt64().Nullable()
                .WithColumn("IsComplete").AsBoolean().WithDefaultValue(false).Nullable()
                .WithColumn("UserNameOrEmailAddress").AsString(255).Nullable();
        }
    }
}