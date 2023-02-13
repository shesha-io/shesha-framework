using FluentMigrator;
using Shesha.Domain;

namespace Shesha.Migrations
{
    [Migration(20200427151600)]
    public class M20200427151600: AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_ProcessableEntities").AddColumn(SheshaDatabaseConsts.DiscriminatorColumn).AsString(SheshaDatabaseConsts.DiscriminatorMaxSize);
            Alter.Table("Core_ProcessConfigurations").AddColumn(SheshaDatabaseConsts.DiscriminatorColumn).AsString(SheshaDatabaseConsts.DiscriminatorMaxSize);
        }
    }
}
