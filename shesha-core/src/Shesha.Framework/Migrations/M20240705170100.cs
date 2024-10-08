using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20240705170100)]
    public class M20240705170100 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"
CREATE VIEW vw_Frwk_PermissionedObjectsFull
AS
with notDeleted as (
	select * from Frwk_PermissionedObjects where IsDeleted = 0 
),
allData as (
	select
		po.*,
		AccessLkp as InheritedAccessLkp,
		Permissions as InheritedPermissions
	from notDeleted po where po.Parent is null or po.Parent = ''
	
	union all

	select
		po.*,
		case when ad.AccessLkp = 2 then ad.InheritedAccessLkp else ad.AccessLkp end as InheritedAccessLkp,
		case when ad.AccessLkp = 2 then ad.InheritedPermissions else ad.Permissions end as InheritedPermissions
	from notDeleted po
	join allData ad on ad.Object = po.Parent
)
select 
	ad.*,
	m.Name as ModuleName,
	case when ad.AccessLkp = 2 then ad.InheritedAccessLkp else ad.AccessLkp end as ActualAccessLkp,
	case when ad.AccessLkp = 2 then ad.InheritedPermissions else ad.Permissions end as ActualPermissions
from allData ad
left join Frwk_Modules m on m.Id = ad.ModuleId
            ");

            IfDatabase("PostgreSql").Execute.Sql(@"
CREATE VIEW vw_Frwk_PermissionedObjectsFull
AS
with RECURSIVE notDeleted as (
	select * from ""Frwk_PermissionedObjects"" where not ""IsDeleted""
),
allData as (
	select
		po.*,
		""AccessLkp"" as ""InheritedAccessLkp"",
		""Permissions"" as ""InheritedPermissions""
	from notDeleted po where po.""Parent"" is null or po.""Parent"" = ''
	
	union all

	select
		po.*,
		case when ad.""AccessLkp"" = 2 then ad.""InheritedAccessLkp"" else ad.""AccessLkp"" end as ""InheritedAccessLkp"",
		case when ad.""AccessLkp"" = 2 then ad.""InheritedPermissions"" else ad.""Permissions"" end as ""InheritedPermissions""
	from notDeleted po
	join allData ad on ad.""Object"" = po.""Parent""
)
select 
	ad.*,
	m.""Name"" as ""ModuleName"",
	case when ad.""AccessLkp"" = 2 then ad.""InheritedAccessLkp"" else ad.""AccessLkp"" end as ""ActualAccessLkp"",
	case when ad.""AccessLkp"" = 2 then ad.""InheritedPermissions"" else ad.""Permissions"" end as ""ActualPermissions""
from allData ad
left join ""Frwk_Modules"" m on m.""Id"" = ad.""ModuleId""
            ");

        }
    }
}
