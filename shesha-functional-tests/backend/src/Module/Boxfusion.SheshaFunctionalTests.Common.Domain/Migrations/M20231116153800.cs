using FluentMigrator;
using Shesha.FluentMigrator;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Migrations
{
    [Migration(20231116153800)]
    public class M20231116153800 : OneWayMigration
    {
        /// <summary>
        /// 
        /// </summary>
        public override void Up()
        {
            Alter.Table("SheshaFunctionalTests_Books").AddColumn("TimeTicks").AsInt64().Nullable();
            Alter.Table("SheshaFunctionalTests_Schools").AddColumn("TimeTicks").AsInt64().Nullable();
        }
    }
}