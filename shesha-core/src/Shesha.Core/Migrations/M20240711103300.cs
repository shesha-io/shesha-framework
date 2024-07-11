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
    [Migration(20240711103300)]
    public class M20240711103300 : Migration
    {
        public override void Up()
        {
            Alter.Table("Core_Organisations").AddColumn("ContactName").AsString().Nullable();
            Alter.Table("Core_Organisations").AddColumn("ContactRole").AsString().Nullable();
            Alter.Table("Core_Organisations").AddColumn("OrderIndex").AsInt64().Nullable();

            this.Shesha().ReferenceListCreate("Shesha.Core", "OrganisationStatus")
            .SetDescription("Organisation Status") // set desctiption
                .SetNoSelectionValue(1);

            Alter.Table("Core_Organisations").AddColumn("StatusLkp").AsInt64().Nullable();
            Delete.Column("VatRegistrationNo").FromTable("Core_Organisations");
            Delete.Column("CompanyRegistrationNo").FromTable("Core_Organisations");


            Delete.ForeignKey("FK_Core_ShaRoleAppointments_OrganisationUnitId_Core_Organisations_Id").OnTable("Core_ShaRoleAppointments");
            Delete.Index("IX_Core_ShaRoleAppointments_OrganisationUnitId").OnTable("Core_ShaRoleAppointments");
            Delete.Column("OrganisationUnitId").FromTable("Core_ShaRoleAppointments");


        }
        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
