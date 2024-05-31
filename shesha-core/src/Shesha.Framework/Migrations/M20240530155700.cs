using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240530155700)]
    public class M20240530155700 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"
update Frwk_EntityProperties set IsDeleted = 0
where 
IsDeleted = 1 and
Name in (
	'CreatorUserId',
	'CreatorUser',
	'CreationTime',
	'IsDeleted',
	'DeleterUserId', 
	'DeleterUser', 
	'DeletionTime', 
	'LastModifierUserId', 
	'LastModifierUser', 
	'LastModificationTime', 
	'Id', 
	'TenantId'
)
            ");

            IfDatabase("PostgreSql").Execute.Sql(@"
update ""Frwk_EntityProperties"" set ""IsDeleted"" = false
where 
""IsDeleted"" and
""Name"" in (
	'CreatorUserId',
	'CreatorUser',
	'CreationTime',
	'IsDeleted',
	'DeleterUserId',
	'DeleterUser',
	'DeletionTime',
	'LastModifierUserId',
	'LastModifierUser',
	'LastModificationTime',
	'Id',
	'TenantId'
)
            ");
        }
    }
}
