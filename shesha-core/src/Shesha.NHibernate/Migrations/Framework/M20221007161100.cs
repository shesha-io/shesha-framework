using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Framework
{
    [Migration(20221007161100), MsSqlOnly]
    public class M20221007161100 : OneWayMigration
    {
        public override void Up()
        {
            Alter.Table("Frwk_EntityConfigs").AddColumn("GenerateAppService").AsBoolean().WithDefaultValue(false).NotNullable();
            Alter.Table("Frwk_ConfigurationItems").AddColumn("Suppress").AsBoolean().WithDefaultValue(false).NotNullable();

            Execute.Sql(
$@"
insert into Frwk_ConfigurationItems
(Id, Name, VersionNo, VersionStatusLkp, ItemType, IsLast, Label, Suppress)
select
Id, Namespace + '.' + ClassName, 1, 3, 'entity', 1, coalesce(FriendlyName, ClassName), 0
from Frwk_EntityConfigs where IsDeleted = 0
");
        }
    }
}
