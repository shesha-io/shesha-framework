using FluentMigrator;
using System;

namespace Shesha.Migrations.EnterpriseMigration
{
    [Migration(20220720153999), MsSqlOnly]
    public class M20220720153999 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            Rename.Column("DetailsValidated").OnTable("Core_Persons").To("entpr_DetailsValidated");
            Rename.Column("EmployeeNo").OnTable("Core_Persons").To("entpr_EmployeeNo");
            Rename.Column("SecurityClearanceLkp").OnTable("Core_Persons").To("entpr_SecurityClearanceLkp");
            Rename.Column("SecurityClearanceEndDate").OnTable("Core_Persons").To("entpr_SecurityClearanceEndDate");
            Rename.Column("OfficeLocationId").OnTable("Core_Persons").To("entpr_OfficeLocationId");
            Rename.Column("OfficeRoomNo").OnTable("Core_Persons").To("entpr_OfficeRoomNo");
            Rename.Column("HasNoComputer").OnTable("Core_Persons").To("entpr_HasNoComputer");
            Rename.Column("IsShiftWorker").OnTable("Core_Persons").To("entpr_IsShiftWorker");
            Rename.Column("SignatureTypeLkp").OnTable("Core_Persons").To("entpr_SignatureTypeLkp");
            Rename.Column("SignatureFileId").OnTable("Core_Persons").To("entpr_SignatureFileId");
            Rename.Column("SmallSignatureFileId").OnTable("Core_Persons").To("entpr_SmallSignatureFileId");
            Rename.Column("OfficeNumber").OnTable("Core_Persons").To("entpr_OfficeNumber");
            Rename.Column("FaxNumber").OnTable("Core_Persons").To("entpr_FaxNumber");

            Delete.Column("SalaryLevel").FromTable("Core_Persons");
            Delete.Column("Notch").FromTable("Core_Persons");
            Delete.Column("OccupationalClassification").FromTable("Core_Persons");
            Delete.Column("Component").FromTable("Core_Persons");
            Delete.Column("OrganisationJobTitle").FromTable("Core_Persons");
            Delete.Column("OrganisationDepartment").FromTable("Core_Persons");

            Delete.ForeignKey("FK_Core_Persons_SupervisorId_Core_Persons_Id").OnTable("Core_Persons");
            Delete.Index("IX_Core_Persons_SupervisorId").OnTable("Core_Persons");
            Delete.Column("SupervisorId").FromTable("Core_Persons");

            Delete.ForeignKey("FK_Core_Persons_ResidentialAddressId_Core_Addresses_Id").OnTable("Core_Persons");
            Delete.Index("IX_Core_Persons_ResidentialAddressId").OnTable("Core_Persons");
            Delete.Column("ResidentialAddressId").FromTable("Core_Persons");

            Delete.ForeignKey("FK_Core_Persons_PostalAddressId_Core_Addresses_Id").OnTable("Core_Persons");
            Delete.Index("IX_Core_Persons_PostalAddressId").OnTable("Core_Persons");
            Delete.Column("PostalAddressId").FromTable("Core_Persons");

            Delete.ForeignKey("FK_Core_Persons_AreaLevel1Id_Core_Areas_Id").OnTable("Core_Persons");
            Delete.Index("IX_Core_Persons_AreaLevel1Id").OnTable("Core_Persons");
            Delete.Column("AreaLevel1Id").FromTable("Core_Persons");

            Delete.ForeignKey("FK_Core_Persons_AreaLevel2Id_Core_Areas_Id").OnTable("Core_Persons");
            Delete.Index("IX_Core_Persons_AreaLevel2Id").OnTable("Core_Persons");
            Delete.Column("AreaLevel2Id").FromTable("Core_Persons");

            Delete.ForeignKey("FK_Core_Persons_AreaLevel3Id_Core_Areas_Id").OnTable("Core_Persons");
            Delete.Index("IX_Core_Persons_AreaLevel3Id").OnTable("Core_Persons");
            Delete.Column("AreaLevel3Id").FromTable("Core_Persons");

            Delete.ForeignKey("FK_Core_Persons_AreaLevel4Id_Core_Areas_Id").OnTable("Core_Persons");
            Delete.Index("IX_Core_Persons_AreaLevel4Id").OnTable("Core_Persons");
            Delete.Column("AreaLevel4Id").FromTable("Core_Persons");
        }
    }
}