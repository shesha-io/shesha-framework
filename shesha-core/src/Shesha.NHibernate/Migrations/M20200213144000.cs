using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations
{
    [Migration(20200213144000)]
    public class M20200213144000: AutoReversingMigration
    {
        public override void Up()
        {
            Alter.Table("Core_Persons").AddForeignKeyColumn("AreaLevel1Id", "Core_Areas");
            Alter.Table("Core_Persons").AddForeignKeyColumn("AreaLevel2Id", "Core_Areas");
            Alter.Table("Core_Persons").AddForeignKeyColumn("AreaLevel3Id", "Core_Areas");
            Alter.Table("Core_Persons").AddForeignKeyColumn("AreaLevel4Id", "Core_Areas");

            var coreFks = new FkInfos
            {
                { "Core_Addresses", "CreatorUserId", "AbpUsers" },
                { "Core_Addresses", "LastModifierUserId", "AbpUsers" },
                { "Core_Addresses", "DeleterUserId", "AbpUsers" },
                { "Core_Addresses", "TenantId", "AbpTenants" },
                { "Core_Areas", "CreatorUserId", "AbpUsers" },
                { "Core_Areas", "LastModifierUserId", "AbpUsers" },
                { "Core_Areas", "DeleterUserId", "AbpUsers" },
                { "Core_Areas", "TenantId", "AbpTenants" },
                { "Core_Areas", "ParentAreaId", "Core_Areas" },
                { "Core_BankAccounts", "CreatorUserId", "AbpUsers" },
                { "Core_BankAccounts", "LastModifierUserId", "AbpUsers" },
                { "Core_BankAccounts", "DeleterUserId", "AbpUsers" },
                { "Core_BankAccounts", "TenantId", "AbpTenants" },
                { "Core_DeviceRegistrations", "CreatorUserId", "AbpUsers" },
                { "Core_DeviceRegistrations", "LastModifierUserId", "AbpUsers" },
                { "Core_DeviceRegistrations", "DeleterUserId", "AbpUsers" },
                { "Core_DeviceRegistrations", "PersonId", "Core_Persons" },
                { "Core_DistributionListItems", "CreatorUserId", "AbpUsers" },
                { "Core_DistributionListItems", "LastModifierUserId", "AbpUsers" },
                { "Core_DistributionListItems", "DeleterUserId", "AbpUsers" },
                { "Core_DistributionListItems", "TenantId", "AbpTenants" },
                { "Core_DistributionListItems", "DistributionListId", "Core_DistributionLists" },
                { "Core_DistributionListItems", "PersonId", "Core_Persons" },
                { "Core_DistributionListItems", "PostId", "Core_OrganisationPosts" },
                { "Core_DistributionListItems", "PostLevelId", "Core_OrganisationPostLevels" },
                { "Core_DistributionListItems", "ShaRoleId", "Core_ShaRoles" },
                { "Core_DistributionLists", "CreatorUserId", "AbpUsers" },
                { "Core_DistributionLists", "LastModifierUserId", "AbpUsers" },
                { "Core_DistributionLists", "DeleterUserId", "AbpUsers" },
                { "Core_DistributionLists", "TenantId", "AbpTenants" },
                { "Core_Facilities", "CreatorUserId", "AbpUsers" },
                { "Core_Facilities", "LastModifierUserId", "AbpUsers" },
                { "Core_Facilities", "DeleterUserId", "AbpUsers" },
                { "Core_Facilities", "AddressId", "Core_Addresses" },
                { "Core_Facilities", "OwnerOrganisationId", "Core_Organisations" },
                { "Core_Facilities", "PrimaryContactId", "Core_Persons" },
                { "Core_FormConfigurations", "CreatorUserId", "AbpUsers" },
                { "Core_FormConfigurations", "LastModifierUserId", "AbpUsers" },
                { "Core_FormConfigurations", "DeleterUserId", "AbpUsers" },
                { "Core_ImportResults", "CreatorUserId", "AbpUsers" },
                { "Core_ImportResults", "LastModifierUserId", "AbpUsers" },
                { "Core_ImportResults", "DeleterUserId", "AbpUsers" },
                { "Core_ImportResults", "TenantId", "AbpTenants" },
                { "Core_ImportResults", "ImportedFileId", "Frwk_StoredFiles" },
                { "Core_ImportResults", "LogFileId", "Frwk_StoredFiles" },
                { "Core_LogonMessageAuditItems", "CreatorUserId", "AbpUsers" },
                { "Core_LogonMessageAuditItems", "MessageId", "Core_LogonMessages" },
                { "Core_LogonMessageAuditItems", "PersonId", "Core_Persons" },
                { "Core_LogonMessages", "CreatorUserId", "AbpUsers" },
                { "Core_LogonMessages", "LastModifierUserId", "AbpUsers" },
                { "Core_LogonMessages", "DeleterUserId", "AbpUsers" },
                { "Core_LogonMessages", "TenantId", "AbpTenants" },
                { "Core_LogonMessages", "DistributionListId", "Core_DistributionLists" },
                { "Core_OrganisationAddresses", "CreatorUserId", "AbpUsers" },
                { "Core_OrganisationAddresses", "LastModifierUserId", "AbpUsers" },
                { "Core_OrganisationAddresses", "DeleterUserId", "AbpUsers" },
                { "Core_OrganisationAddresses", "TenantId", "AbpTenants" },
                { "Core_OrganisationAddresses", "AddressId", "Core_Addresses" },
                { "Core_OrganisationAddresses", "OrganisationId", "Core_Organisations" },
                { "Core_OrganisationBankAccounts", "CreatorUserId", "AbpUsers" },
                { "Core_OrganisationBankAccounts", "LastModifierUserId", "AbpUsers" },
                { "Core_OrganisationBankAccounts", "DeleterUserId", "AbpUsers" },
                { "Core_OrganisationBankAccounts", "TenantId", "AbpTenants" },
                { "Core_OrganisationBankAccounts", "BankAccountId", "Core_BankAccounts" },
                { "Core_OrganisationBankAccounts", "OrganisationId", "Core_Organisations" },
                { "Core_OrganisationPersons", "CreatorUserId", "AbpUsers" },
                { "Core_OrganisationPersons", "LastModifierUserId", "AbpUsers" },
                { "Core_OrganisationPersons", "DeleterUserId", "AbpUsers" },
                { "Core_OrganisationPersons", "TenantId", "AbpTenants" },
                { "Core_OrganisationPersons", "OrganisationId", "Core_Organisations" },
                { "Core_OrganisationPersons", "PersonId", "Core_Persons" },
                { "Core_OrganisationPostAppointments", "CreatorUserId", "AbpUsers" },
                { "Core_OrganisationPostAppointments", "LastModifierUserId", "AbpUsers" },
                { "Core_OrganisationPostAppointments", "DeleterUserId", "AbpUsers" },
                { "Core_OrganisationPostAppointments", "TenantId", "AbpTenants" },
                { "Core_OrganisationPostAppointments", "EmployeeId", "Core_Persons" },
                { "Core_OrganisationPostAppointments", "OrganisationPostId", "Core_OrganisationPosts" },
                { "Core_OrganisationPostAppointments", "StoredFileId", "Frwk_StoredFiles" },
                { "Core_OrganisationPostLevels", "CreatorUserId", "AbpUsers" },
                { "Core_OrganisationPostLevels", "LastModifierUserId", "AbpUsers" },
                { "Core_OrganisationPostLevels", "DeleterUserId", "AbpUsers" },
                { "Core_OrganisationPostLevels", "TenantId", "AbpTenants" },
                { "Core_OrganisationPosts", "CreatorUserId", "AbpUsers" },
                { "Core_OrganisationPosts", "LastModifierUserId", "AbpUsers" },
                { "Core_OrganisationPosts", "DeleterUserId", "AbpUsers" },
                { "Core_OrganisationPosts", "TenantId", "AbpTenants" },
                { "Core_OrganisationPosts", "OrganisationPostLevelId", "Core_OrganisationPostLevels" },
                { "Core_OrganisationPosts", "OrganisationUnitId", "Core_Organisations" },
                { "Core_OrganisationPosts", "SupervisorPostId", "Core_OrganisationPosts" },
                { "Core_Organisations", "CreatorUserId", "AbpUsers" },
                { "Core_Organisations", "LastModifierUserId", "AbpUsers" },
                { "Core_Organisations", "DeleterUserId", "AbpUsers" },
                { "Core_Organisations", "TenantId", "AbpTenants" },
                { "Core_Organisations", "AreaLevel1Id", "Core_Areas" },
                { "Core_Organisations", "AreaLevel2Id", "Core_Areas" },
                { "Core_Organisations", "AreaLevel3Id", "Core_Areas" },
                { "Core_Organisations", "AreaLevel4Id", "Core_Areas" },
                { "Core_Organisations", "PrimaryAddressId", "Core_Addresses" },
                { "Core_Organisations", "PrimaryContactId", "Core_Persons" },
                { "Core_Organisations", "UtilMan_ContractorId", "Core_Organisations" },
                { "Core_Organisations", "UtilMan_TeamLeadId", "Core_Persons" },
                { "Core_Organisations", "ParentId", "Core_Organisations" },
                { "Core_Periods", "CreatorUserId", "AbpUsers" },
                { "Core_Periods", "LastModifierUserId", "AbpUsers" },
                { "Core_Periods", "DeleterUserId", "AbpUsers" },
                { "Core_Periods", "ParentPeriodId", "Core_Periods" },
                { "Core_Persons", "CreatorUserId", "AbpUsers" },
                { "Core_Persons", "LastModifierUserId", "AbpUsers" },
                { "Core_Persons", "DeleterUserId", "AbpUsers" },
                { "Core_Persons", "TenantId", "AbpTenants" },
                { "Core_Persons", "PhotoId", "Frwk_StoredFiles" },
                { "Core_Persons", "PrimaryOrganisationId", "Core_Organisations" },
                { "Core_Persons", "SignatureFileId", "Frwk_StoredFiles" },
                { "Core_Persons", "SmallSignatureFileId", "Frwk_StoredFiles" },
                { "Core_Persons", "SupervisorId", "Core_Persons" },
                { "Core_Persons", "OfficeLocationId", "Core_Areas" },
                { "Core_Persons", "PostalAddressId", "Core_Addresses" },
                { "Core_Persons", "ResidentialAddressId", "Core_Addresses" },
                { "Core_Persons", "UserId", "AbpUsers" },
                { "Core_PublicHolidays", "CreatorUserId", "AbpUsers" },
                { "Core_PublicHolidays", "LastModifierUserId", "AbpUsers" },
                { "Core_PublicHolidays", "DeleterUserId", "AbpUsers" },
                { "Core_Services", "CreatorUserId", "AbpUsers" },
                { "Core_Services", "LastModifierUserId", "AbpUsers" },
                { "Core_Services", "DeleterUserId", "AbpUsers" },
                { "Core_Services", "TenantId", "AbpTenants" },
                { "Core_ShaRoleAppointmentEntities", "CreatorUserId", "AbpUsers" },
                { "Core_ShaRoleAppointmentEntities", "LastModifierUserId", "AbpUsers" },
                { "Core_ShaRoleAppointmentEntities", "DeleterUserId", "AbpUsers" },
                { "Core_ShaRoleAppointmentEntities", "TenantId", "AbpTenants" },
                { "Core_ShaRoleAppointmentEntities", "AppointmentId", "Core_ShaRoleAppointments" },
                { "Core_ShaRoleAppointments", "CreatorUserId", "AbpUsers" },
                { "Core_ShaRoleAppointments", "LastModifierUserId", "AbpUsers" },
                { "Core_ShaRoleAppointments", "DeleterUserId", "AbpUsers" },
                { "Core_ShaRoleAppointments", "TenantId", "AbpTenants" },
                { "Core_ShaRoleAppointments", "WorkflowRoleId", "Core_ShaRoles" },
                { "Core_ShaRoleAppointments", "PersonId", "Core_Persons" },
                { "Core_ShaRoleAppointments", "OrganisationPostLevelId", "Core_OrganisationPostLevels" },
                { "Core_ShaRoleAppointments", "OrganisationUnitId", "Core_Organisations" },
                { "Core_ShaRoleAppointments", "OrganisationPostId", "Core_OrganisationPosts" },
                { "Core_ShaRoles", "CreatorUserId", "AbpUsers" },
                { "Core_ShaRoles", "LastModifierUserId", "AbpUsers" },
                { "Core_ShaRoles", "DeleterUserId", "AbpUsers" },
                { "Core_ShaRoles", "TenantId", "AbpTenants" },
                { "Core_TeamMembers", "CreatorUserId", "AbpUsers" },
                { "Core_TeamMembers", "LastModifierUserId", "AbpUsers" },
                { "Core_TeamMembers", "DeleterUserId", "AbpUsers" },
                { "Core_TeamMembers", "TeamId", "Core_Organisations" },
                { "Core_TeamMembers", "PersonId", "Core_Persons" },
            };

            foreach (var fk in coreFks)
            {
                if (!Schema.Table(fk.ForeignTable).Exists())
                    continue;
                if (!Schema.Table(fk.MasterTable).Exists())
                    continue;
                if (!Schema.Table(fk.ForeignTable).Column(fk.ForeignColumn).Exists())
                    continue;

                if (!Schema.Table(fk.ForeignTable).Index(fk.IndexName).Exists())
                    Create.Index(fk.IndexName).OnTable(fk.ForeignTable).OnColumn(fk.ForeignColumn);
            }

            var frameworkFks = new FkInfos
            {
                { "Frwk_EntityConfigs", "CreatorUserId", "AbpUsers" },
                { "Frwk_EntityConfigs", "LastModifierUserId", "AbpUsers" },
                { "Frwk_EntityConfigs", "DeleterUserId", "AbpUsers" },
                { "Frwk_Notes", "CreatorUserId", "AbpUsers" },
                { "Frwk_Notes", "LastModifierUserId", "AbpUsers" },
                { "Frwk_Notes", "DeleterUserId", "AbpUsers" },
                { "Frwk_Notes", "TenantId", "AbpTenants" },
                { "Frwk_Notes", "ParentId", "Frwk_Notes" },
                { "Frwk_ReferenceListItems", "CreatorUserId", "AbpUsers" },
                { "Frwk_ReferenceListItems", "LastModifierUserId", "AbpUsers" },
                { "Frwk_ReferenceListItems", "DeleterUserId", "AbpUsers" },
                { "Frwk_ReferenceListItems", "TenantId", "AbpTenants" },
                { "Frwk_ReferenceListItems", "ParentId", "Frwk_ReferenceListItems" },
                { "Frwk_ReferenceListItems", "ReferenceListId", "Frwk_ReferenceLists" },
                { "Frwk_ReferenceLists", "CreatorUserId", "AbpUsers" },
                { "Frwk_ReferenceLists", "LastModifierUserId", "AbpUsers" },
                { "Frwk_ReferenceLists", "DeleterUserId", "AbpUsers" },
                { "Frwk_ReferenceLists", "TenantId", "AbpTenants" },
                { "Frwk_StoredFiles", "CreatorUserId", "AbpUsers" },
                { "Frwk_StoredFiles", "LastModifierUserId", "AbpUsers" },
                { "Frwk_StoredFiles", "DeleterUserId", "AbpUsers" },
                { "Frwk_StoredFiles", "TenantId", "AbpTenants" },
                { "Frwk_StoredFiles", "ParentFileId", "Frwk_StoredFiles" },
                { "Frwk_StoredFileVersions", "CreatorUserId", "AbpUsers" },
                { "Frwk_StoredFileVersions", "LastModifierUserId", "AbpUsers" },
                { "Frwk_StoredFileVersions", "DeleterUserId", "AbpUsers" },
                { "Frwk_StoredFileVersions", "TenantId", "AbpTenants" },
                { "Frwk_StoredFileVersions", "FileId", "Frwk_StoredFiles" },
                { "Frwk_VersionedFields", "CreatorUserId", "AbpUsers" },
                { "Frwk_VersionedFields", "LastModifierUserId", "AbpUsers" },
                { "Frwk_VersionedFields", "DeleterUserId", "AbpUsers" },
                { "Frwk_VersionedFields", "TenantId", "AbpTenants" },
                { "Frwk_VersionedFieldVersions", "CreatorUserId", "AbpUsers" },
                { "Frwk_VersionedFieldVersions", "LastModifierUserId", "AbpUsers" },
                { "Frwk_VersionedFieldVersions", "DeleterUserId", "AbpUsers" },
                { "Frwk_VersionedFieldVersions", "TenantId", "AbpTenants" },
                { "Frwk_VersionedFieldVersions", "FieldId", "Frwk_VersionedFields" },
            };

            foreach (var fk in frameworkFks)
            {
                if (!Schema.Table(fk.ForeignTable).Exists())
                    continue;
                if (!Schema.Table(fk.MasterTable).Exists())
                    continue;
                if (!Schema.Table(fk.ForeignTable).Column(fk.ForeignColumn).Exists())
                    continue;

                if (!Schema.Table(fk.ForeignTable).Index(fk.IndexName).Exists())
                    Create.Index(fk.IndexName).OnTable(fk.ForeignTable).OnColumn(fk.ForeignColumn);
            }
        }
    }
}
