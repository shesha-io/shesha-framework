using FluentMigrator;
using System;

namespace Shesha.Migrations.EnterpriseMigration
{
    [Migration(20220720164299)]
    public class M20220720164299 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            Create.Column("AuthenticationGuid").OnTable("AbpUsers").AsString(36).Nullable();
            Create.Column("AuthenticationGuidExpiresOn").OnTable("AbpUsers").AsDateTime().Nullable();
            Create.Column("OtpEnabled").OnTable("AbpUsers").AsBoolean().SetExistingRowsTo(false);
            Create.Column("RequireChangePassword").OnTable("AbpUsers").AsBoolean().SetExistingRowsTo(false);

            Execute.Sql(
@"update 
	u
set
	AuthenticationGuid = p.AuthenticationGuid,
	AuthenticationGuidExpiresOn = p.AuthenticationGuidExpiresOn,
	OtpEnabled = p.OtpEnabled,
	RequireChangePassword = p.RequireChangePassword
from
	AbpUsers u
	inner join Core_Persons p on p.UserId = u.Id");


            if (Schema.Table("Core_Persons").Column("Username").Exists())
                Delete.Column("Username").FromTable("Core_Persons");

            Execute.Sql(
@"update 
	u
set
	IsEmailConfirmed = (case when p.EmailAddressConfirmed = 1 or u.IsEmailConfirmed = 1 then 1 else 0 end),
	IsPhoneNumberConfirmed = (case when p.MobileNumberConfirmed = 1 or p.IsMobileVerified = 1 or u.IsEmailConfirmed = 1 then 1 else 0 end)
from
	AbpUsers u
	inner join Core_Persons p on p.UserId = u.Id");

            Delete.Column("EmailAddressConfirmed").FromTable("Core_Persons");
            Delete.Column("MobileNumberConfirmed").FromTable("Core_Persons");
            Delete.Column("IsMobileVerified").FromTable("Core_Persons");

            Create.Column("TypeOfAccountLkp").OnTable("AbpUsers").AsInt64().Nullable();
            Execute.Sql(
@"update
	u
set
	TypeOfAccountLkp = p.TypeOfAccountLkp
from
	AbpUsers u
	inner join Core_Persons p on p.UserId = u.Id");

            Delete.Column("TypeOfAccountLkp").FromTable("Core_Persons");
        }
    }
}
