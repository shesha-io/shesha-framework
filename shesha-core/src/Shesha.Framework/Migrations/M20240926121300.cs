using FluentMigrator;
using FluentMigrator.Expressions;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20240926121300)]
    public class M20240926121300 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_PermissionedObjects").AddColumn("Md5").AsStringMax().Nullable();
        }
    }
}
