using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20231101115400)]
    public class M20231101115400 : OneWayMigration
    {
        public override void Up()
        {
            this.Shesha().ReferenceListCreate("Shesha.Core", "AddressType");
        }
    }
}