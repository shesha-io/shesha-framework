using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20251009101000)]
    public class M20251009101000: OneWayMigration
    {
        public override void Up()
        {
            Create.Table("SheshaFunctionalTests_Events")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("Title").AsString().Nullable()
                .WithColumn("Description").AsString(int.MaxValue).Nullable()
                .WithColumn("StartDate").AsDateTime().Nullable()
                .WithColumn("EndDate").AsDateTime().Nullable();
        }
    }
}
