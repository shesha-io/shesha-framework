using FluentMigrator;
using Shesha.FluentMigrator;
using System;

namespace Shesha.Migrations
{
    [Migration(20231011125499)]
    public class M20231011125499 : OneWayMigration
    {
        public override void Up()
        {
            IfDatabase("SqlServer").Execute.Sql(@"update 
	AbpUsers 
set 
	PhoneNumber = p.MobileNumber1,
	EmailAddress = p.EmailAddress1,
	Name = p.FirstName,
	Surname = p.LastName,
	NormalizedEmailAddress = upper(p.EmailAddress1)
from
	AbpUsers
	inner join Core_Persons p on p.UserId = AbpUsers.Id
where
	AbpUsers.PhoneNumber <> p.MobileNumber1 or
	AbpUsers.EmailAddress <> p.EmailAddress1 or
	AbpUsers.Name <> p.FirstName or
	AbpUsers.Surname <> p.LastName or
	AbpUsers.NormalizedEmailAddress <> upper(p.EmailAddress1)");

            IfDatabase("SqlServer").Execute.Sql(@"ALTER TRIGGER dbo.trg_Core_Persons_UpdateContacts_AU
   ON  dbo.Core_Persons
   AFTER update
AS 
BEGIN
	SET NOCOUNT ON;
	
	IF UPDATE (MobileNumber1) or UPDATE(EmailAddress1) or UPDATE(FirstName) or UPDATE(LastName)
    begin
		update 
			AbpUsers 
		set 
			PhoneNumber = i.MobileNumber1,
			EmailAddress = i.EmailAddress1,
			Name = i.FirstName,
			Surname = i.LastName,
			NormalizedEmailAddress = upper(i.EmailAddress1)
		from
			AbpUsers
			inner join inserted i on i.UserId = AbpUsers.Id
	end
END");

			IfDatabase("PostgreSql").Execute.Sql(@"CREATE OR REPLACE FUNCTION public.""log_Core_Persons_UpdateContacts_AU""()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
	IF OLD.""MobileNumber1"" <> NEW.""MobileNumber1"" OR OLD.""EmailAddress1"" <> NEW.""EmailAddress1""  OR OLD.""FirstName"" <> NEW.""FirstName"" OR OLD.""LastName"" <> NEW.""LastName"" THEN
		update 
			""AbpUsers"" 
		set 
			""PhoneNumber"" = NEW.""MobileNumber1"",
			""EmailAddress"" = NEW.""EmailAddress1"",
			""Name"" = NEW.""FirstName"",
			""Surname"" = NEW.""LastName"",
			""NormalizedEmailAddress"" = upper(NEW.""EmailAddress1"")
		where
			""AbpUsers"".""Id"" = OLD.""UserId"";
	END IF;

	RETURN NEW;
END;
$function$
;");

			IfDatabase("PostgreSql").Execute.Sql(@"update 
	""AbpUsers"" u 
set 
	""PhoneNumber"" = p.""MobileNumber1"",
	""EmailAddress"" = p.""EmailAddress1"",
	""Name"" = p.""FirstName"",
	""Surname"" = p.""LastName"",
	""NormalizedEmailAddress"" = upper(p.""EmailAddress1"")
from
	""Core_Persons"" p
where
	p.""UserId"" = u.""Id""
	and (
		u.""PhoneNumber"" <> p.""MobileNumber1"" or
		u.""EmailAddress"" <> p.""EmailAddress1"" or
		u.""Name"" <> p.""FirstName"" or
		u.""Surname"" <> p.""LastName"" or
		u.""NormalizedEmailAddress"" <> upper(p.""EmailAddress1"")
	)
");
        }
    }
}
