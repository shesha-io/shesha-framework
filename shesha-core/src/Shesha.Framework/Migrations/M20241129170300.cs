using FluentMigrator;
using FluentMigrator.Expressions;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20241129170300)]
    public class M20241129170300 : OneWayMigration
    {
        public override void Up()
        {
            Execute.Sql(@"delete from ""Frwk_PermissionedObjects"" where ""AccessLkp"" = 2 and ""type"" like 'Shesha.WebApi%'");

            Alter.Table("Frwk_PermissionedObjects").AddColumn("Hardcoded").AsBoolean().Nullable();
        }
    }
}
