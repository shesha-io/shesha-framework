using FluentMigrator;
using Shesha.FluentMigrator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Migrations.Abp
{
    [Migration(20220321152099)]
    public class M20220321152099 : Migration
    {
        public override void Down()
        {
            throw new NotImplementedException();
        }

        public override void Up()
        {
            #region 20191216011543_Upgraded_To_Abp_5_1_0

            var indexExists = Schema.Table("AbpUserLoginAttempts").Index("IX_AbpUserLoginAttempts_TenancyName_UserNameOrEmailAddress_Result").Exists();
            if (indexExists)
                Delete.Index("IX_AbpUserLoginAttempts_TenancyName_UserNameOrEmailAddress_Result").OnTable("AbpUserLoginAttempts");

            Alter.Column("UserNameOrEmailAddress").OnTable("AbpUserLoginAttempts").AsString(256).Nullable();

            if (indexExists)
                Execute.Sql($"CREATE INDEX IX_AbpUserLoginAttempts_TenancyName_UserNameOrEmailAddress_Result ON AbpUserLoginAttempts(TenancyName, UserNameOrEmailAddress, Result)");

            //Alter.Column("Value").OnTable("AbpSettings").AsString(256).Nullable();

            #endregion

            #region Upgraded_To_Abp_5_2_0

            Create.Table("AbpWebhookEvents")
                .WithColumn("Id").AsGuid().NotNullable().PrimaryKey("PK_AbpWebhookEvents")
                .WithColumn("WebhookName").AsStringMax().NotNullable()
                .WithColumn("Data").AsStringMax().Nullable()
                .WithCreationTimeColumn()
                .WithTenantIdAsNullable()
                .WithIsDeletedColumn()
                .WithDeletionTimeColumn();

            Create.Table("AbpWebhookSubscriptions")
                .WithColumn("Id").AsGuid().NotNullable().PrimaryKey("PK_AbpWebhookSubscriptions")
                .WithCreationTimeColumn()
                .WithCreatorUserIdColumn()
                .WithTenantIdAsNullable()
                .WithColumn("WebhookUri").AsStringMax().NotNullable()
                .WithColumn("Secret").AsStringMax().NotNullable()
                .WithColumn("IsActive").AsBoolean().NotNullable()
                .WithColumn("Webhooks").AsStringMax().Nullable()
                .WithColumn("Headers").AsStringMax().Nullable()

                .WithColumn("WebhookName").AsStringMax().NotNullable()
                .WithColumn("Data").AsStringMax().Nullable();

            Create.Table("AbpWebhookSendAttempts")
                .WithColumn("Id").AsGuid().NotNullable().PrimaryKey("PK_AbpWebhookSendAttempts")
                .WithColumn("Response").AsStringMax().Nullable()
                .WithColumn("ResponseStatusCode").AsInt32().Nullable()
                .WithCreationTimeColumn()
                .WithLastModificationTimeColumn()
                .WithTenantIdAsNullable()
                
                .WithColumn("WebhookEventId").AsGuid().NotNullable()
                .WithColumn("WebhookSubscriptionId").AsGuid().NotNullable();

            Create.ForeignKey("FK_AbpWebhookSendAttempts_AbpWebhookEvents_WebhookEventId")
                .FromTable("AbpWebhookSendAttempts")
                .ForeignColumn("WebhookEventId")
                .ToTable("AbpWebhookEvents")
                .PrimaryColumn("Id")
                .OnDelete(System.Data.Rule.Cascade);

            Create.Index("IX_AbpWebhookSendAttempts_WebhookEventId").OnTable("AbpWebhookSendAttempts").OnColumn("WebhookEventId");

            #endregion

            #region Upgraded_To_Abp_5_4_0

            Delete.Index("IX_AbpOrganizationUnits_TenantId_Code").OnTable("AbpOrganizationUnits");

            /*
            Create.Table("AbpDynamicParameters")
                .WithColumn("Id").AsInt32().NotNullable().Identity().PrimaryKey("PK_AbpDynamicParameters")
                .WithColumn("ParameterName").AsStringMax().Nullable()
                .WithColumn("InputType").AsStringMax().Nullable()
                .WithColumn("Permission").AsStringMax().Nullable()
                .WithTenantIdAsNullable();

            Create.Table("AbpDynamicParameterValues")
                .WithColumn("Id").AsInt32().NotNullable().Identity().PrimaryKey("PK_AbpDynamicParameterValues")
                .WithColumn("Value").AsStringMax().NotNullable()
                .WithTenantIdAsNullable()
                .WithColumn("DynamicParameterId").AsInt32().NotNullable();

            Create.ForeignKey("FK_AbpDynamicParameterValues_AbpDynamicParameters_DynamicParameterId")
                .FromTable("AbpDynamicParameterValues")
                .ForeignColumn("DynamicParameterId")
                .ToTable("AbpDynamicParameters")
                .PrimaryColumn("Id")
                .OnDelete(System.Data.Rule.Cascade);

            Create.Table("AbpEntityDynamicParameters")
                .WithColumn("Id").AsInt32().NotNullable().Identity().PrimaryKey("PK_AbpEntityDynamicParameters")
                .WithColumn("EntityFullName").AsStringMax().Nullable()
                .WithColumn("DynamicParameterId").AsInt32().NotNullable()
                .WithTenantIdAsNullable();
            Create.ForeignKey("FK_AbpEntityDynamicParameters_AbpDynamicParameters_DynamicParameterId")
                .FromTable("AbpEntityDynamicParameters")
                .ForeignColumn("DynamicParameterId")
                .ToTable("AbpDynamicParameters")
                .PrimaryColumn("Id")
                .OnDelete(System.Data.Rule.Cascade);

            Create.Table("AbpEntityDynamicParameterValues")
                .WithColumn("Id").AsInt32().NotNullable().Identity().PrimaryKey("PK_AbpEntityDynamicParameterValues")
                .WithColumn("Value").AsStringMax().NotNullable()
                .WithColumn("EntityId").AsStringMax().Nullable()
                .WithColumn("EntityDynamicParameterId").AsInt32().NotNullable()
                .WithTenantIdAsNullable();
            Create.ForeignKey("FK_AbpEntityDynamicParameterValues_AbpEntityDynamicParameters_EntityDynamicParameterId")
                .FromTable("AbpEntityDynamicParameterValues")
                .ForeignColumn("EntityDynamicParameterId")
                .ToTable("AbpEntityDynamicParameters")
                .PrimaryColumn("Id")
                .OnDelete(System.Data.Rule.Cascade);

            Create.Index("IX_AbpDynamicParameterValues_DynamicParameterId").OnTable("AbpDynamicParameterValues").OnColumn("DynamicParameterId");
            Create.Index("IX_AbpEntityDynamicParameters_DynamicParameterId").OnTable("AbpEntityDynamicParameters").OnColumn("DynamicParameterId");
            Create.Index("IX_AbpEntityDynamicParameterValues_EntityDynamicParameterId").OnTable("AbpEntityDynamicParameterValues").OnColumn("EntityDynamicParameterId");
            */
            Execute.Sql($"CREATE UNIQUE INDEX IX_AbpOrganizationUnits_TenantId_Code ON AbpOrganizationUnits(TenantId, Code) WHERE TenantId IS NOT NULL");
            /*
            Execute.Sql($"CREATE UNIQUE INDEX IX_AbpDynamicParameters_ParameterName_TenantId ON AbpDynamicParameters(ParameterName, TenantId) WHERE ParameterName IS NOT NULL and TenantId IS NOT NULL");

            Execute.Sql($"CREATE UNIQUE INDEX IX_AbpEntityDynamicParameters_EntityFullName_DynamicParameterId_TenantId ON AbpEntityDynamicParameters(EntityFullName, DynamicParameterId, TenantId) WHERE EntityFullName IS NOT NULL and TenantId IS NOT NULL");
            */
            
            #endregion

            #region Upgraded_To_Abp_5_9

            Delete.Index("IX_AbpOrganizationUnits_TenantId_Code").OnTable("AbpOrganizationUnits");
            Execute.Sql($"CREATE INDEX IX_AbpOrganizationUnits_TenantId_Code ON AbpOrganizationUnits(TenantId, Code)");

            #endregion

            #region Upgraded_To_ABP_5_13_0

            /*
            Delete.Table("AbpDynamicParameterValues");
            Delete.Table("AbpEntityDynamicParameterValues");
            Delete.Table("AbpEntityDynamicParameters");
            Delete.Table("AbpDynamicParameters");
            */


            Create.Table("AbpDynamicProperties")
                .WithColumn("Id").AsInt32().NotNullable().Identity().PrimaryKey("PK_AbpDynamicProperties")
                .WithColumn("PropertyName").AsString(256).Nullable()
                .WithColumn("InputType").AsStringMax().Nullable()
                .WithColumn("Permission").AsStringMax().Nullable()
                .WithTenantIdAsNullable();

            Create.Table("AbpDynamicEntityProperties")
                .WithColumn("Id").AsInt32().NotNullable().Identity().PrimaryKey("PK_AbpDynamicEntityProperties")
                .WithColumn("EntityFullName").AsString(256).Nullable()
                .WithColumn("DynamicPropertyId").AsInt32().NotNullable()
                .WithTenantIdAsNullable();
            Create.ForeignKey("FK_AbpDynamicEntityProperties_AbpDynamicProperties_DynamicPropertyId")
                .FromTable("AbpDynamicEntityProperties")
                .ForeignColumn("DynamicPropertyId")
                .ToTable("AbpDynamicProperties")
                .PrimaryColumn("Id")
                .OnDelete(System.Data.Rule.Cascade);

            Create.Table("AbpDynamicPropertyValues")
                .WithColumn("Id").AsInt64().NotNullable().Identity().PrimaryKey("PK_AbpDynamicPropertyValues")
                .WithColumn("Value").AsStringMax().NotNullable()
                .WithColumn("DynamicPropertyId").AsInt32().NotNullable()
                .WithTenantIdAsNullable();
            Create.ForeignKey("FK_AbpDynamicPropertyValues_AbpDynamicProperties_DynamicPropertyId")
                .FromTable("AbpDynamicPropertyValues")
                .ForeignColumn("DynamicPropertyId")
                .ToTable("AbpDynamicProperties")
                .PrimaryColumn("Id")
                .OnDelete(System.Data.Rule.Cascade);

            Create.Table("AbpDynamicEntityPropertyValues")
                .WithColumn("Id").AsInt64().NotNullable().Identity().PrimaryKey("PK_AbpDynamicEntityPropertyValues")
                .WithColumn("Value").AsStringMax().NotNullable()
                .WithColumn("EntityId").AsStringMax().Nullable()
                .WithColumn("DynamicEntityPropertyId").AsInt32().NotNullable()
                .WithTenantIdAsNullable();
            Create.ForeignKey("FK_AbpDynamicEntityPropertyValues_AbpDynamicEntityProperties_DynamicEntityPropertyId")
                .FromTable("AbpDynamicEntityPropertyValues")
                .ForeignColumn("DynamicEntityPropertyId")
                .ToTable("AbpDynamicEntityProperties")
                .PrimaryColumn("Id")
                .OnDelete(System.Data.Rule.Cascade);

            Create.Index("IX_AbpDynamicEntityProperties_DynamicPropertyId").OnTable("AbpDynamicEntityProperties").OnColumn("DynamicPropertyId");
            Execute.Sql($"CREATE UNIQUE INDEX IX_AbpDynamicEntityProperties_EntityFullName_DynamicPropertyId_TenantId ON AbpDynamicEntityProperties(EntityFullName, DynamicPropertyId, TenantId) WHERE EntityFullName IS NOT NULL and TenantId IS NOT NULL");
            Create.Index("IX_AbpDynamicEntityPropertyValues_DynamicEntityPropertyId").OnTable("AbpDynamicEntityPropertyValues").OnColumn("DynamicEntityPropertyId");
            Execute.Sql($"CREATE UNIQUE INDEX IX_AbpDynamicProperties_PropertyName_TenantId ON AbpDynamicProperties(PropertyName, TenantId) WHERE PropertyName IS NOT NULL and TenantId IS NOT NULL");
            Create.Index("IX_AbpDynamicPropertyValues_DynamicPropertyId").OnTable("AbpDynamicPropertyValues").OnColumn("DynamicPropertyId");

            #endregion

            #region Upgraded_To_ABP_6_0

            Create.Column("NewValueHash").OnTable("AbpEntityPropertyChanges").AsStringMax().Nullable();
            Create.Column("OriginalValueHash").OnTable("AbpEntityPropertyChanges").AsStringMax().Nullable();
            Create.Column("DisplayName").OnTable("AbpDynamicProperties").AsStringMax().Nullable();

            #endregion

            #region Upgrade_To_ABP_6_3

            Alter.Column("ExceptionMessage").OnTable("AbpAuditLogs").AsString(1024).Nullable();

            #endregion

            #region Upgrade_To_ABP_6_4_rc1

            Execute.Sql($"CREATE UNIQUE INDEX IX_AbpUserLogins_ProviderKey_TenantId ON AbpUserLogins(ProviderKey, TenantId) WHERE TenantId IS NOT NULL");

            #endregion

        }
    }
}