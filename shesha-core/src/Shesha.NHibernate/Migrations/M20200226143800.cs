using System;
using FluentMigrator;

namespace Shesha.Migrations
{
	[Migration(20200226143800)]
    public class M20200226143800: Migration
    {
        public override void Up()
        {
            Execute.Sql(
@"create view vw_core_ShaRoleAppointedPersons
as
select 
	app.Id,
	app.PersonId,
	app.RoleId,
	app.TenantId,
	p.FullName,
	usr.UserName,
	(stuff(
		(
			select 
				', ' + t.Name
			from 
				Core_Organisations t
				inner join Core_TeamMembers tm on tm.TeamId = t.Id and tm.IsDeleted = 0 and tm.Inactive = 0
			where
				tm.PersonId = p.Id
			for xml path('')
		), 1, 1, ''
	)) as Teams,
	(stuff(
		(
			select 
				', ' + a.Name
			from 
				Core_ShaRoleAppointmentEntities e
				inner join Core_Areas a on cast(a.Id as varchar(40)) = e.EntityId
			where
				e.AppointmentId = app.Id
			for xml path('')
		), 1, 1, ''
	)) as Regions,
	app.CreationTime,
	creator.UserName as CreatedBy,
	app.LastModificationTime
from 
	Core_ShaRoleAppointments app
	inner join Core_Persons p on p.Id = app.PersonId and p.IsDeleted = 0
	left join AbpUsers usr on usr.Id = p.UserId
	left join AbpUsers creator on creator.Id = app.CreatorUserId
where
	app.IsDeleted = 0
	and app.Frwk_Discriminator = '1'");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
