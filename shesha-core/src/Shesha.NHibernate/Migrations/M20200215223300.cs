using System;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200215223300)]
    public class M20200215223300: Migration
    {
        public override void Up()
        {
            Execute.Sql(
@"insert into 
	Core_Persons 
	(id, Firstname, Lastname, Frwk_Discriminator, TenantId, UserId, CreationTime, IsDeleted, EmailAddressConfirmed, MobileNumberConfirmed, IsLocked, OtpEnabled, RequireChangePassword)
select
	newid(), 'System', 'Administrator', 'Core.Person', TenantId, Id, GETDATE(), 0, 1, 0, 0, 0, 0
from
	AbpUsers
where
	UserName = 'admin'
	and not exists (select 1 from Core_Persons where UserId = AbpUsers.Id)");

            // insert default `System Administrator` role
            Execute.Sql(
@$"insert into Core_ShaRoles 
    (Id, 
    NameSpace, 
    Name, 
    Description, 
    CanAssignToMultiple, 
    CanAssignToPerson, 
    CanAssignToOrganisationRoleLevel,
    CanAssignToRole,
    CanAssignToUnit,
    HardLinkToApplication,
    IsProcessConfigurationSpecific,
    SortIndex) 
values 
    (NEWID(), 
    '', 
    'System Administrator',
    'Can access certain administrative functions required for the general monitoring and maintenance of the system (e.g. Log audit trails, Scheduled Jobs Maintenance, Notification templates).', 
    1, 
    1, 
    0,
    0,
    0,  
    1,
    0,
    0)");

            Execute.Sql(
@"insert into 
	Core_ShaRoleAppointments
	(id, RoleId, Frwk_Discriminator, PersonId, CreationTime, IsDeleted)
select
	NEWID(), r.Id, 1, p.Id, GETDATE(), 0
from
	Core_ShaRoles r
	inner join Core_Persons p on 1=1
	inner join AbpUsers usr on usr.Id = p.UserId and usr.UserName = 'admin'
where
	r.Name = 'System Administrator'
	and not exists (
		select 
			1 
		from 
			Core_ShaRoleAppointments t
		where 
			t.RoleId = r.Id
			and t.PersonId = p.Id
	)");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
