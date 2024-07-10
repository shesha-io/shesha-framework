using FluentMigrator;
using NUglify;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations
{
    [Migration(20240709123400)]
    public class M20240709123400: Migration
    {
        public override void Up()
        {
            Alter.Table("Core_Organisations").AddColumn("ContactName").AsString().Nullable();
            Alter.Table("Core_Organisations").AddColumn("ContactRole").AsString().Nullable();
            Alter.Table("Core_Organisations").AddColumn("OrderIndex").AsInt64().Nullable();

            this.Shesha().ReferenceListCreate("Shesha.Core", "Status");

            Alter.Table("Core_Organisations").AddColumn("StatusLkp").AsInt64().Nullable();

            Delete.Column("OrganisationUnit").FromTable("Core_ShaRoleAppointments");
            Delete.Column("VatRegistrationNo").FromTable("Core_Organisations");
            Delete.Column("CompanyRegistrationNo").FromTable("Core_Organisations");
        }
        public override void Down() 
        {
            throw new NotImplementedException();
        }
    }
}
