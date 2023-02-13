using System;
using FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200217122900)]
    public class M20200217122900: Migration
    {
        public override void Up()
        {
            Execute.Sql(
@"IF EXISTS (SELECT * FROM sys.triggers WHERE object_id = OBJECT_ID(N'[dbo].[trg_Core_Persons_UpdateContacts_AU]'))
DROP TRIGGER [dbo].[trg_Core_Persons_UpdateContacts_AU]");

            Execute.Sql(
@"CREATE TRIGGER trg_Core_Persons_UpdateContacts_AU
   ON  Core_Persons
   AFTER update
AS 
BEGIN
	SET NOCOUNT ON;
	
	IF UPDATE (MobileNumber1) or UPDATE(EmailAddress1)
    begin
		update 
			AbpUsers 
		set 
			PhoneNumber = i.MobileNumber1,
			EmailAddress = i.EmailAddress1
		from
			AbpUsers
			inner join inserted i on i.UserId = AbpUsers.Id
	end
END");

            Execute.Sql(
@"update 
	AbpUsers 
set 
	PhoneNumber = p.MobileNumber1
from
	AbpUsers
	inner join Core_Persons p on p.UserId = AbpUsers.Id
where
	coalesce(p.MobileNumber1, '') <> coalesce(AbpUsers.PhoneNumber, '')");
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
