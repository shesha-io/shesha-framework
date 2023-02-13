using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20191210162500)]
    public class M20191210162500 : AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.Address
            Create.Table("Core_Addresses")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("AddressLine1").AsString(200).Nullable()
                .WithColumn("AddressLine2").AsString(200).Nullable()
                .WithColumn("AddressLine3").AsString(200).Nullable()
                .WithColumn("AddressTypeLkp").AsInt32().Nullable()
                .WithColumn("Latitude").AsDecimal().Nullable()
                .WithColumn("Longitude").AsDecimal().Nullable()
                .WithColumn("POBox").AsString(10).Nullable()
                .WithColumn("Suburb").AsString(100).Nullable()
                .WithColumn("Town").AsString(100).Nullable();

            // Shesha.Domain.Area
            Create.Table("Core_Areas")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Comments").AsString(200).Nullable()
                .WithColumn("Name").AsString(100).Nullable()
                .WithForeignKeyColumn("ParentAreaId", "Core_Areas")
                .WithColumn("ShortName").AsString(10).Nullable()
                .WithDiscriminator();

            // Shesha.Domain.BankAccount
            Create.Table("Core_BankAccounts")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("AccountHolderName").AsString(100).Nullable()
                .WithColumn("AccountNumber").AsString(20).Nullable()
                .WithColumn("AccountTypeLkp").AsInt32().Nullable()
                .WithColumn("BankLkp").AsInt32().Nullable()
                .WithColumn("BranchCode").AsString(10).Nullable()
                .WithColumn("BranchName").AsString(100).Nullable()
                .WithColumn("OtherAccountType").AsString(50).Nullable();



            // Shesha.Domain.DistributionList
            Create.Table("Core_DistributionLists")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Name").AsString(255).Nullable()
                .WithColumn("Namespace").AsString(255).Nullable();

            // Shesha.Domain.FormConfiguration
            Create.Table("Core_FormConfigurations")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("Name").AsString(255).Nullable()
                .WithDiscriminator();

            // Shesha.Domain.ImportResult
            Create.Table("Core_ImportResults")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("AvgSpeed").AsDecimal()
                .WithColumn("Comment").AsString(300).Nullable()
                .WithColumn("ErrorMessage").AsStringMax().Nullable()
                .WithColumn("FinishedOn").AsDateTime().Nullable()
                .WithForeignKeyColumn("ImportedFileId", "Frwk_StoredFiles")
                .WithColumn("ImportedFileMD5").AsString(50).Nullable()
                .WithColumn("IsSuccess").AsBoolean()
                .WithForeignKeyColumn("LogFileId", "Frwk_StoredFiles")
                .WithColumn("RowsAffected").AsInt32()
                .WithColumn("RowsInactivated").AsInt32()
                .WithColumn("RowsInserted").AsInt32()
                .WithColumn("RowsSkipped").AsInt32()
                .WithColumn("RowsSkippedNotChanged").AsInt32()
                .WithColumn("RowsUpdated").AsInt32()
                .WithColumn("SourceTypeLkp").AsInt32().Nullable()
                .WithColumn("StartedOn").AsDateTime().Nullable();


            // Shesha.Domain.LogonMessage
            Create.Table("Core_LogonMessages")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Content").AsStringMax().Nullable()
                .WithColumn("Description").AsString(500).Nullable()
                .WithForeignKeyColumn("DistributionListId", "Core_DistributionLists")
                .WithColumn("IsActive").AsBoolean()
                .WithColumn("PublicationEndDate").AsDateTime().Nullable()
                .WithColumn("PublicationStartDate").AsDateTime().Nullable()
                .WithColumn("VisibilityLkp").AsInt32();

            // Shesha.Domain.OrganisationBase
            Create.Table("Core_Organisations")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Description").AsString(300).Nullable()
                .WithColumn("FreeTextAddress").AsString(1000).Nullable()
                .WithColumn("Name").AsString(255).Nullable()
                .WithColumn("OrganisationTypeLkp").AsInt32().Nullable()
                .WithColumn("ShortAlias").AsString(50).Nullable()
                .WithDiscriminator();

            // Shesha.Domain.OrganisationPostLevel
            Create.Table("Core_OrganisationPostLevels")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("DaysAllowedToRespond").AsInt32().Nullable()
                .WithColumn("Description").AsString(300).Nullable()
                .WithColumn("FullName").AsString(100).Nullable()
                .WithColumn("RankLevel").AsInt32().Nullable()
                .WithColumn("ShortName").AsString(30).Nullable()
                .WithColumn("SignOffAmount").AsDecimal().Nullable();

            // Shesha.Domain.Period
            Create.Table("Core_Periods")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("Name").AsString(1000).Nullable()
                .WithForeignKeyColumn("ParentPeriodId", "Core_Periods")
                .WithColumn("PeriodEnd").AsDateTime().Nullable()
                .WithColumn("PeriodStart").AsDateTime().Nullable()
                .WithColumn("PeriodTypeLkp").AsInt32().Nullable()
                .WithColumn("ShortName").AsString(100).Nullable();

            // Shesha.Domain.PublicHoliday
            Create.Table("Core_PublicHolidays")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("Date").AsDateTime().Nullable()
                .WithColumn("Name").AsString(300).Nullable();


            // Shesha.Domain.Service
            Create.Table("Core_Services")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Comments").AsString(300).Nullable()
                .WithColumn("Description").AsString(300).Nullable()
                .WithColumn("ServiceCategoryLkp").AsInt32().Nullable()
                .WithColumn("ServiceName").AsString(200).Nullable();

            // Shesha.Domain.ShaRole
            Create.Table("Core_ShaRoles")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("CanAssignToMultiple").AsBoolean()
                .WithColumn("CanAssignToOrganisationRoleLevel").AsBoolean()
                .WithColumn("CanAssignToPerson").AsBoolean()
                .WithColumn("CanAssignToRole").AsBoolean()
                .WithColumn("CanAssignToUnit").AsBoolean()
                .WithColumn("Description").AsString(2000).Nullable()
                .WithColumn("HardLinkToApplication").AsBoolean()
                .WithColumn("IsProcessConfigurationSpecific").AsBoolean()
                .WithColumn("Name").AsString(500).Nullable()
                .WithColumn("NameSpace").AsString(200).Nullable()
                .WithColumn("SortIndex").AsInt32();

            // Shesha.Domain.ShaRoleAppointment
            Create.Table("Core_ShaRoleAppointments")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithForeignKeyColumn("WorkflowRoleId", "Core_ShaRoles")
                .WithDiscriminator();

            // Shesha.Domain.ShaRoleAppointmentEntity
            Create.Table("Core_ShaRoleAppointmentEntities")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithForeignKeyColumn("AppointmentId", "Core_ShaRoleAppointments")
                .WithColumn("EntityId").AsStringMax().Nullable()
                .WithColumn("EntityTypeAlias").AsStringMax().Nullable();

            // Shesha.Domain.Team
            Alter.Table("Core_Organisations")
                .AddForeignKeyColumn("AreaLevel1Id", "Core_Areas")
                .AddForeignKeyColumn("AreaLevel2Id", "Core_Areas")
                .AddForeignKeyColumn("AreaLevel3Id", "Core_Areas")
                .AddForeignKeyColumn("AreaLevel4Id", "Core_Areas");

            // Shesha.Domain.Organisation
            Alter.Table("Core_Organisations")
                .AddColumn("CompanyRegistrationNo").AsString(30).Nullable()
                .AddColumn("VatRegistrationNo").AsString(30).Nullable();

            // Shesha.Domain.OrganisationAddress
            Create.Table("Core_OrganisationAddresses")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithForeignKeyColumn("AddressId", "Core_Addresses")
                .WithColumn("Inactive").AsBoolean()
                .WithForeignKeyColumn("OrganisationId", "Core_Organisations")
                .WithColumn("RoleLkp").AsInt32().Nullable()
                .WithColumn("ValidFromDate").AsDateTime().Nullable()
                .WithColumn("ValidToDate").AsDateTime().Nullable();

            // Shesha.Domain.OrganisationBankAccount
            Create.Table("Core_OrganisationBankAccounts")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithForeignKeyColumn("BankAccountId", "Core_BankAccounts")
                .WithColumn("Inactive").AsBoolean()
                .WithForeignKeyColumn("OrganisationId", "Core_Organisations")
                .WithColumn("RoleLkp").AsInt32().Nullable()
                .WithColumn("ValidFromDate").AsDateTime().Nullable()
                .WithColumn("ValidToDate").AsDateTime().Nullable();

            // Shesha.Domain.Person
            Create.Table("Core_Persons")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("AuthenticationGuid").AsString(36).Nullable()
                .WithColumn("AuthenticationGuidExpiresOn").AsDateTime().Nullable()
                .WithColumn("CustomShortName").AsString(60).Nullable()
                .WithColumn("DateOfBirth").AsDateTime().Nullable()
                .WithColumn("EmailAddress1").AsString(100).Nullable()
                .WithColumn("EmailAddress2").AsString(100).Nullable()
                .WithColumn("EmailAddressConfirmed").AsBoolean()
                .WithColumn("FaxNumber").AsString(20).Nullable()
                .WithColumn("FirstName").AsString(50).Nullable()
                .WithColumn("FullName").AsStringMax().Nullable()
                .WithColumn("FullName2").AsStringMax().Nullable()
                .WithColumn("GenderLkp").AsInt32().Nullable()
                .WithColumn("HomeNumber").AsString(20).Nullable()
                .WithColumn("IdentityNumber").AsString(13).Nullable()
                .WithColumn("Initials").AsString(10).Nullable()
                .WithColumn("IsLocked").AsBoolean()
                .WithColumn("LastName").AsString(50).Nullable()
                .WithColumn("MobileNumber1").AsString(20).Nullable()
                .WithColumn("MobileNumber2").AsString(20).Nullable()
                .WithColumn("MobileNumberConfirmed").AsBoolean()
                .WithColumn("OfficeNumber").AsString(20).Nullable()
                .WithColumn("OrganisationDepartment").AsString(100).Nullable()
                .WithColumn("OrganisationJobTitle").AsString(100).Nullable()
                .WithColumn("OtpEnabled").AsBoolean()
                .WithForeignKeyColumn("PhotoId", "Frwk_StoredFiles")
                .WithColumn("PreferredContactMethodLkp").AsInt32().Nullable()
                .WithForeignKeyColumn("PrimaryOrganisationId", "Core_Organisations")
                .WithColumn("RequireChangePassword").AsBoolean()
                .WithForeignKeyColumn("SignatureFileId", "Frwk_StoredFiles")
                .WithForeignKeyColumn("SmallSignatureFileId", "Frwk_StoredFiles")
                .WithForeignKeyColumn("SupervisorId", "Core_Persons")
                .WithColumn("TitleLkp").AsInt32().Nullable()
                .WithColumn("TypeOfAccountLkp").AsInt32().Nullable()
                .WithColumn("UserName").AsString(300).Nullable()
                .WithDiscriminator();

            // Shesha.Domain.ShaRoleAppointedPerson
            Alter.Table("Core_ShaRoleAppointments")
                .AddForeignKeyColumn("PersonId", "Core_Persons");

            // Shesha.Domain.ShaRoleAppointedPostLevel
            Alter.Table("Core_ShaRoleAppointments")
                .AddForeignKeyColumn("OrganisationPostLevelId", "Core_OrganisationPostLevels");

            // Shesha.Domain.TeamMember
            Create.Table("Core_TeamMembers")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithForeignKeyColumn("TeamId", "Core_Organisations")
                .WithColumn("Inactive").AsBoolean()
                .WithForeignKeyColumn("PersonId", "Core_Persons")
                .WithColumn("RoleLkp").AsInt32().Nullable()
                .WithColumn("ValidFromDate").AsDateTime().Nullable()
                .WithColumn("ValidToDate").AsDateTime().Nullable()
                .WithDiscriminator();

            // Shesha.Domain.DeviceRegistration
            Create.Table("Core_DeviceRegistrations")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("AppId").AsString(1000).Nullable()
                .WithColumn("DeviceRegistrationId").AsString(1000).Nullable()
                .WithForeignKeyColumn("PersonId", "Core_Persons");

            // Shesha.Domain.Employee
            Alter.Table("Core_Persons")
                .AddColumn("Component").AsStringMax().Nullable()
                .AddColumn("DetailsValidated").AsBoolean().Nullable()
                .AddColumn("EmployeeNo").AsString(20).Nullable()
                .AddColumn("HasNoComputer").AsBoolean().Nullable()
                .AddColumn("IsShiftWorker").AsBoolean().Nullable()
                .AddColumn("Notch").AsInt32().Nullable()
                .AddColumn("OccupationalClassification").AsStringMax().Nullable()
                .AddForeignKeyColumn("OfficeLocationId", "Core_Areas")
                .AddColumn("OfficeRoomNo").AsString(20).Nullable()
                .AddForeignKeyColumn("PostalAddressId", "Core_Addresses")
                .AddForeignKeyColumn("ResidentialAddressId", "Core_Addresses")
                .AddColumn("SalaryLevel").AsInt32().Nullable()
                .AddColumn("SecurityClearanceLkp").AsInt32().Nullable()
                .AddColumn("SecurityClearanceEndDate").AsDateTime().Nullable()
                .AddColumn("SignatureTypeLkp").AsInt32().Nullable();

            // Shesha.Domain.Facility
            Create.Table("Core_Facilities")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithForeignKeyColumn("AddressId", "Core_Addresses")
                .WithColumn("Description").AsString(300).Nullable()
                .WithColumn("FacilityTypeLkp").AsInt32().Nullable()
                .WithColumn("Name").AsString(100).Nullable()
                .WithForeignKeyColumn("OwnerOrganisationId", "Core_Organisations")
                .WithForeignKeyColumn("PrimaryContactId", "Core_Persons");

            // Shesha.Domain.LogonMessageAuditItem
            Create.Table("Core_LogonMessageAuditItems")
                .WithIdAsGuid()
                .WithCreationAuditColumns()
                .WithColumn("DontShowAgain").AsBoolean()
                .WithForeignKeyColumn("MessageId", "Core_LogonMessages")
                .WithForeignKeyColumn("PersonId", "Core_Persons");

            // Shesha.Domain.OrganisationPerson
            Create.Table("Core_OrganisationPersons")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("Description").AsString(300).Nullable()
                .WithColumn("Inactive").AsBoolean()
                .WithColumn("IsPrimary").AsBoolean()
                .WithForeignKeyColumn("OrganisationId", "Core_Organisations")
                .WithForeignKeyColumn("PersonId", "Core_Persons")
                .WithColumn("RoleLkp").AsInt32().Nullable()
                .WithColumn("ValidFromDate").AsDateTime().Nullable()
                .WithColumn("ValidToDate").AsDateTime().Nullable();

            // Shesha.Domain.OrganisationUnit
            Alter.Table("Core_Organisations")
                .AddForeignKeyColumn("PrimaryAddressId", "Core_Addresses")
                .AddForeignKeyColumn("PrimaryContactId", "Core_Persons");

            // Shesha.Domain.ShaRoleAppointedUnit
            Alter.Table("Core_ShaRoleAppointments")
                .AddForeignKeyColumn("OrganisationUnitId", "Core_Organisations");

            // Shesha.Domain.OrganisationPost
            Create.Table("Core_OrganisationPosts")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("IsUnitSupervisor").AsBoolean()
                .WithColumn("Name").AsString(100).Nullable()
                .WithForeignKeyColumn("OrganisationPostLevelId", "Core_OrganisationPostLevels")
                .WithForeignKeyColumn("OrganisationUnitId", "Core_Organisations")
                .WithColumn("PostDiscriminator").AsString(100).Nullable()
                .WithColumn("ShortName").AsString(100).Nullable()
                .WithForeignKeyColumn("SupervisorPostId", "Core_OrganisationPosts");

            // Shesha.Domain.OrganisationPostAppointment
            Create.Table("Core_OrganisationPostAppointments")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("AppointmentEndDate").AsDateTime().Nullable()
                .WithColumn("AppointmentStartDate").AsDateTime().Nullable()
                .WithColumn("AppointmentStatusLkp").AsInt32()
                .WithColumn("Comment").AsStringMax().Nullable()
                .WithForeignKeyColumn("EmployeeId", "Core_Persons")
                .WithForeignKeyColumn("OrganisationPostId", "Core_OrganisationPosts")
                .WithForeignKeyColumn("StoredFileId", "Frwk_StoredFiles")
                .WithColumn("UserHasOpened").AsBoolean();

            // Shesha.Domain.ShaRoleAppointedPost
            Alter.Table("Core_ShaRoleAppointments")
                .AddForeignKeyColumn("OrganisationPostId", "Core_OrganisationPosts");

            // Shesha.Domain.DistributionListItem
            Create.Table("Core_DistributionListItems")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithTenantIdAsNullable()
                .WithColumn("CC").AsString(255).Nullable()
                .WithForeignKeyColumn("DistributionListId", "Core_DistributionLists")
                .WithColumn("Email").AsString(255).Nullable()
                .WithColumn("MobileNo").AsString(20).Nullable()
                .WithColumn("Name").AsString(255).Nullable()
                .WithColumn("NotifyByEmail").AsBoolean()
                .WithColumn("NotifyBySms").AsBoolean()
                .WithForeignKeyColumn("PersonId", "Core_Persons")
                .WithForeignKeyColumn("PostId", "Core_OrganisationPosts")
                .WithForeignKeyColumn("PostLevelId", "Core_OrganisationPostLevels")
                .WithForeignKeyColumn("ShaRoleId", "Core_ShaRoles")
                .WithColumn("SubTypeLkp").AsInt32().Nullable()
                .WithColumn("TypeLkp").AsInt32();
        }
    }
}