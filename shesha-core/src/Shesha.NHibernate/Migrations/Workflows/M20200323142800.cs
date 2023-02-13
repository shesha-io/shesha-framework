using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.Workflows
{
    [Migration(20200323142800)]
    public class M20200323142800: AutoReversingMigration
    {
        public override void Up()
        {
            // Shesha.Domain.Notification
            Create.Table("Core_Notifications")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("Description").AsStringMax().Nullable()
                .WithColumn("EscalateAfterSla").AsBoolean()
                .WithColumn("InitiateTask").AsBoolean()
                .WithColumn("Name").AsString(255).Nullable()
                .WithColumn("Namespace").AsString(255).Nullable()
                .WithForeignKeyColumn("NotificationDistributionListId", "Core_DistributionLists")
                .WithColumn("NotifyByEmail").AsBoolean()
                .WithColumn("NotifyByPush").AsBoolean()
                .WithColumn("NotifyBySms").AsBoolean()
                .WithColumn("SlaHours").AsDouble().Nullable()
                .WithColumn("TaskActionName").AsString(255).Nullable()
                .WithColumn("TaskDescription").AsStringMax().Nullable()
                .WithForeignKeyColumn("TaskDistributionListId", "Core_DistributionLists")
                .WithForeignKeyColumn("TaskEscalationDistributionListId", "Core_DistributionLists");

            // Shesha.Domain.Workflow.ConfigurableHumanActivity
            Create.Table("Core_ConfigurableHumanActivities")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("ActionName").AsString(255).Nullable()
                .WithColumn("ActionType").AsInt32().Nullable()
                .WithColumn("CanConfigureActiveOn").AsBoolean()
                .WithColumn("CanConfigureAssignees").AsBoolean()
                .WithColumn("CanConfigureCheckpointDate").AsBoolean()
                .WithColumn("CanConfigureDueDate").AsBoolean()
                .WithColumn("CustomizationUid").AsString(40).Nullable()
                .WithColumn("IsDraftStep").AsBoolean()
                .WithColumn("WorkflowDefinitionName").AsString(255).Nullable();

            // Shesha.Domain.Workflow.WorkflowDefinition
            Create.Table("Core_WorkflowDefinitions")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("AssemblyName").AsString(300).Nullable()
                .WithColumn("ConfigurableActivitiesCreated").AsBoolean()
                .WithColumn("Content").AsStringMax().Nullable()
                .WithColumn("Description").AsStringMax().Nullable()
                .WithColumn("IsDefault").AsBoolean()
                .WithColumn("IsSystem").AsBoolean()
                .WithColumn("Name").AsString(300).Nullable()
                .WithForeignKeyColumn("ParentDefinitionId", "Core_WorkflowDefinitions")
                .WithColumn("Version").AsInt32();

            // Shesha.Domain.Workflow.WorkflowInstance
            Create.Table("Core_WorkflowInstances")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("DateCompleted").AsDateTime().Nullable()
                .WithColumn("DateDue").AsDateTime().Nullable()
                .WithForeignKeyColumn("InitiatedByLocationId", "Core_Areas")
                .WithForeignKeyColumn("InitiatedByOrgUnitId", "Core_Organisations")
                .WithForeignKeyColumn("InitiatedByPersonId", "Core_Persons")
                .WithForeignKeyColumn("WorkflowDefinitionId", "Core_WorkflowDefinitions");

            // Shesha.Domain.Workflow.WorkflowInstanceOwner
            Create.Table("Core_WorkflowInstanceOwners")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("IsPrimary").AsBoolean()
                .WithForeignKeyColumn("LocationId", "Core_Areas")
                .WithForeignKeyColumn("PersonId", "Core_Persons")
                .WithForeignKeyColumn("UnitId", "Core_Organisations")
                .WithForeignKeyColumn("UnitLevel1Id", "Core_Organisations")
                .WithForeignKeyColumn("UnitLevel2Id", "Core_Organisations")
                .WithForeignKeyColumn("UnitLevel3Id", "Core_Organisations")
                .WithForeignKeyColumn("UnitLevel4Id", "Core_Organisations")
                .WithForeignKeyColumn("WorkflowInstanceId", "Core_WorkflowInstances");

            // Shesha.Domain.Workflow.WorkflowTask
            Create.Table("Core_WorkflowTasks")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("ActionText").AsString(400).Nullable()
                .WithColumn("ActionType").AsInt32().Nullable()
                .WithColumn("BookmarkName").AsString(300).Nullable()
                .WithForeignKeyColumn("ConfigurableHumanActivityId", "Core_ConfigurableHumanActivities")
                .WithColumn("HideFromProgressIndicator").AsBoolean()
                .WithColumn("IsPlaceHolder").AsBoolean()
                .WithForeignKeyColumn("ParentTaskId", "Core_WorkflowTasks")
                .WithColumn("SortIndexOnProgressIndicator").AsInt32().Nullable()
                .WithColumn("TaskTypeLkp").AsInt32()
                .WithForeignKeyColumn("WorkflowInstanceId", "Core_WorkflowInstances");

            // Shesha.Domain.Workflow.ProcessConfiguration
            Create.Table("Core_ProcessConfigurations")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("CreateMenuVisibilityModeLkp").AsInt32()
                .WithColumn("DisplayName").AsString(150).Nullable()
                .WithForeignKeyColumn("GlobalMonitorRoleId", "Core_ShaRoles")
                .WithForeignKeyColumn("InitiatingRoleId", "Core_ShaRoles")
                .WithForeignKeyColumn("InitiatingUnitId", "Core_Organisations")
                .WithColumn("IsSystem").AsBoolean()
                .WithColumn("IsVisible").AsBoolean()
                .WithColumn("LogItemOpenings").AsBoolean()
                .WithColumn("LogPdfDownloads").AsBoolean()
                .WithColumn("MenuItemDescription").AsString(400).Nullable()
                .WithColumn("MenuItemName").AsString(200).Nullable()
                .WithColumn("MenuItemSortOrder").AsInt32()
                .WithColumn("Name").AsString(50).Nullable()
                .WithColumn("NumberGeneratorClass").AsString(40).Nullable()
                .WithForeignKeyColumn("ParentItemTypeId", "Core_ProcessConfigurations")
                .WithColumn("ShowDashboard").AsBoolean()
                .WithColumn("ShowSecurityClassification").AsBoolean()
                .WithColumn("ShowUrgentFlag").AsBoolean()
                .WithColumn("StrictVisibilityToSignatoryOnly").AsBoolean()
                .WithColumn("SubTypeLkp").AsInt64()
                .WithColumn("TypeShortAlias").AsString(50).Nullable()
                .WithForeignKeyColumn("UnitMonitorRoleId", "Core_ShaRoles")
                .WithColumn("UrgentByDefault").AsBoolean()
                .WithColumn("VisibilityModeLkp").AsInt32().Nullable()
                .WithForeignKeyColumn("WorkflowDefinitionId", "Core_WorkflowDefinitions")
                .WithColumn("WorkflowDefinitionSelectionPolicyLkp").AsInt32();

            // Shesha.Domain.Workflow.ProcessConfigurationDocumentTemplate
            Create.Table("Core_ProcessConfigurationDocumentTemplates")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("Description").AsStringMax().Nullable()
                .WithForeignKeyColumn("DocumentTemplateId", "Frwk_StoredFiles")
                .WithColumn("EmailTemplate").AsStringMax().Nullable()
                .WithForeignKeyColumn("ItemTypeId", "Core_ProcessConfigurations")
                .WithColumn("Name").AsString(300).Nullable()
                .WithColumn("SortOrder").AsInt64();

            // Shesha.Domain.Workflow.HumanActivityConfiguration
            Create.Table("Core_HumanActivityConfigurations")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("ActionName").AsString(255).Nullable()
                .WithForeignKeyColumn("ActivityId", "Core_ConfigurableHumanActivities")
                .WithColumn("AssignmentExclusionCustomLogicUid").AsString(40).Nullable()
                .WithColumn("AssignmentExclusionModelLkp").AsInt32().Nullable()
                .WithColumn("AssignmentInitiatorSupervisorMinRankLevel").AsInt32()
                .WithColumn("AssignmentModelLkp").AsInt32().Nullable()
                .WithForeignKeyColumn("AssignmentPersonId", "Core_Persons")
                .WithForeignKeyColumn("AssignmentPostId", "Core_OrganisationPosts")
                .WithForeignKeyColumn("AssignmentRoleId", "Core_ShaRoles")
                .WithForeignKeyColumn("AssignmentSameAsPreviousStepId", "Core_ConfigurableHumanActivities")
                .WithColumn("AssignmentWorkflowProperty").AsString(1024).Nullable()
                .WithColumn("CanEditProcessableEntity").AsBoolean()
                .WithColumn("CanSendBack").AsBoolean()
                .WithColumn("CanSendBackToPreviousStep").AsBoolean()
                .WithColumn("CanViewInWord").AsBoolean()
                .WithColumn("CheckpointModelLkp").AsInt32().Nullable()
                .WithColumn("CheckpointValue").AsDecimal()
                .WithColumn("CustomLogicUid").AsString(40).Nullable()
                .WithColumn("DelegationLevelProvider").AsString(40).Nullable()
                .WithColumn("Description").AsStringMax().Nullable()
                .WithColumn("Disabled").AsBoolean()
                .WithColumn("DontAssignToUnavailablePersons").AsBoolean()
                .WithColumn("EscalateToPost").AsBoolean()
                .WithColumn("EscalateToPostReminderFrequencyLkp").AsInt32().Nullable()
                .WithColumn("EscalateToPostSLAPeriod").AsDecimal()
                .WithColumn("EscalateToSupervisor").AsBoolean()
                .WithColumn("EscalateToSupervisorReminderFrequencyLkp").AsInt32().Nullable()
                .WithColumn("EscalateToSupervisorSLAPeriod").AsDecimal()
                .WithForeignKeyColumn("EscalationPostId", "Core_ShaRoles")
                .WithColumn("IsReassignable").AsBoolean()
                .WithColumn("IsWorkflowOwner").AsBoolean()
                .WithColumn("MustClaimItemWhenMultipleAssignments").AsBoolean()
                .WithForeignKeyColumn("NotificationOnPositiveResultId", "Core_Notifications")
                .WithColumn("NotifyAssigneesOnAssignment").AsBoolean()
                .WithColumn("NotifyInitiatorOnCompletion").AsBoolean()
                .WithForeignKeyColumn("ProcessConfigurationId", "Core_ProcessConfigurations")
                .WithForeignKeyColumn("ReassignByRoleId", "Core_ShaRoles")
                .WithColumn("RoundRobinAssignmentModelLkp").AsInt32().Nullable()
                .WithForeignKeyColumn("SkipByRoleId", "Core_ShaRoles")
                .WithForeignKeyColumn("SLABusinessDaysFromPreviousStepId", "Core_ConfigurableHumanActivities")
                .WithColumn("SLAModelLkp").AsInt32().Nullable()
                .WithColumn("SLAValue").AsDecimal();

            // Shesha.Domain.Workflow.ProcessableEntity
            Create.Table("Core_ProcessableEntities")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("CompletionDate").AsDateTime().Nullable()
                .WithForeignKeyColumn("ExecutedById", "Core_Persons")
                .WithColumn("FullNumber").AsString(300).Nullable()
                .WithColumn("IsArchived").AsBoolean()
                .WithColumn("IsHidden").AsBoolean()
                .WithColumn("Number").AsString(150).Nullable()
                .WithColumn("PriorityLkp").AsInt32()
                .WithForeignKeyColumn("ProcessConfigurationId", "Core_ProcessConfigurations")
                .WithColumn("RestoredOn").AsDateTime().Nullable()
                .WithColumn("SecurityClassificationLkp").AsInt32().Nullable()
                .WithColumn("StatusLkp").AsInt32().Nullable()
                .WithColumn("Subject").AsStringMax().Nullable()
                .WithForeignKeyColumn("SubmittedById", "Core_Persons")
                .WithForeignKeyColumn("SubmittedByRoleId", "Core_OrganisationPosts")
                .WithColumn("SubmittedDate").AsDateTime().Nullable()
                .WithColumn("SubStatus").AsInt32().Nullable();

            // Shesha.Domain.Workflow.ProcessableEntityDocument
            Create.Table("Core_ProcessableEntityDocuments")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithForeignKeyColumn("EntityId", "Core_ProcessableEntities")
                .WithForeignKeyColumn("FileId", "Frwk_StoredFiles")
                .WithColumn("IsFinal").AsBoolean()
                .WithForeignKeyColumn("TemplateId", "Core_ProcessConfigurationDocumentTemplates");

            // Shesha.Domain.Workflow.WorkflowExecutionLogItem
            Create.Table("Core_WorkflowExecutionLogItems")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithForeignKeyColumn("ActivatedByPersonId", "Core_Persons")
                .WithColumn("ActiveOn").AsDateTime().Nullable()
                .WithColumn("CheckpointDate").AsDateTime().Nullable()
                .WithForeignKeyColumn("CompletedByLocationId", "Core_Areas")
                .WithForeignKeyColumn("CompletedByPersonId", "Core_Persons")
                .WithForeignKeyColumn("CompletedByUnitId", "Core_Organisations")
                .WithColumn("CompletedOn").AsDateTime().Nullable()
                .WithColumn("InProgressComments").AsString(150).Nullable()
                .WithColumn("IsGrayedOut").AsBoolean()
                .WithColumn("IsLast").AsBoolean()
                .WithColumn("Outcome").AsString(150).Nullable()
                .WithColumn("OverdueDate").AsDateTime().Nullable()
                .WithForeignKeyColumn("PreviousLogItemId", "Core_WorkflowExecutionLogItems")
                .WithColumn("Response").AsStringMax().Nullable()
                .WithColumn("ResultLkp").AsInt32().Nullable()
                .WithColumn("Subresult").AsInt32().Nullable()
                .WithColumn("TimeTakenToCompleteExcludingReferralsTicks").AsInt64().Nullable()
                .WithColumn("UserComments").AsStringMax().Nullable()
                .WithForeignKeyColumn("WorkflowInstanceId", "Core_WorkflowInstances")
                .WithForeignKeyColumn("WorkflowTaskId", "Core_WorkflowTasks");

            // Shesha.Domain.Workflow.WorkflowHighLevelAssignee
            Create.Table("Core_WorkflowHighLevelAssignees")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("AssigneeRoleLkp").AsInt32()
                .WithForeignKeyColumn("ExecutionLogItemId", "Core_WorkflowExecutionLogItems")
                .WithColumn("ItemDisplayName").AsString(300).Nullable()
                .WithColumn("ItemId").AsString(40).Nullable()
                .WithColumn("TypeShortAlias").AsString(50).Nullable()
                .WithForeignKeyColumn("WorkflowTaskId", "Core_WorkflowTasks");

            // Shesha.Domain.Workflow.WorkflowTodoItem
            Create.Table("Core_WorkflowTodoItems")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("ActiveOn").AsDateTime()
                .WithColumn("BookmarkName").AsString(300).Nullable();

            // Shesha.Domain.Workflow.WorkflowAssignee
            Create.Table("Core_WorkflowAssignees")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithForeignKeyColumn("AssignedPersonId", "Core_Persons")
                .WithForeignKeyColumn("ExecutionLogItemId", "Core_WorkflowExecutionLogItems")
                .WithColumn("FirstOpened").AsDateTime().Nullable()
                .WithForeignKeyColumn("HighLevelAssigneeId", "Core_WorkflowHighLevelAssignees")
                .WithColumn("LastOpened").AsDateTime().Nullable()
                .WithColumn("NumOfOpenings").AsInt32()
                .WithForeignKeyColumn("PersonId", "Core_Persons")
                .WithForeignKeyColumn("TodoItemId", "Core_WorkflowTodoItems")
                .WithColumn("UserHasOpened").AsBoolean()
                .WithForeignKeyColumn("WorkflowInstanceId", "Core_WorkflowInstances");

            Alter.Table("Core_WorkflowExecutionLogItems")
                .AddForeignKeyColumn("CompletedByAssigneeId", "Core_WorkflowAssignees")
                .AddForeignKeyColumn("CompletedByHighLevelAssigneeId", "Core_WorkflowHighLevelAssignees");

            // Shesha.Domain.Workflow.WorkflowHighLevelAssigneeDependency
            Create.Table("Core_WorkflowHighLevelAssigneeDependencies")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithForeignKeyColumn("HighLevelAssigneeId", "Core_WorkflowHighLevelAssignees")
                .WithColumn("ItemId").AsString(40).Nullable()
                .WithColumn("ItemTypeAlias").AsString(50).Nullable();

            // Shesha.Domain.Workflow.WorkflowMessage
            Create.Table("Core_WorkflowMessages")
                .WithIdAsGuid()
                .WithFullAuditColumns()
                .WithColumn("Content").AsStringMax().Nullable()
                .WithForeignKeyColumn("DestinationExecutionLogItemId", "Core_WorkflowExecutionLogItems")
                .WithForeignKeyColumn("DestinationPersonId", "Core_Persons")
                .WithForeignKeyColumn("DestinationWorkflowTaskId", "Core_WorkflowTasks")
                .WithColumn("IsRead").AsBoolean()
                .WithColumn("MessageTypeLkp").AsInt32()
                .WithForeignKeyColumn("ParentMessageId", "Core_WorkflowMessages")
                .WithColumn("PostedDate").AsDateTime()
                .WithForeignKeyColumn("SenderExecutionLogItemId", "Core_WorkflowExecutionLogItems")
                .WithForeignKeyColumn("SenderPersonId", "Core_Persons")
                .WithForeignKeyColumn("WorkflowInstanceId", "Core_WorkflowInstances");

            Alter.Table("Core_WorkflowTodoItems")
                .AddForeignKeyColumn("ExecutionLogItemId", "Core_WorkflowExecutionLogItems")
                .AddForeignKeyColumn("HighLevelAssigneeId", "Core_WorkflowHighLevelAssignees")
                .AddForeignKeyColumn("WorkflowAssigneeId", "Core_WorkflowAssignees")
                .AddForeignKeyColumn("WorkflowInstanceId", "Core_WorkflowInstances")
                .AddForeignKeyColumn("WorkflowTaskId", "Core_WorkflowTasks");
        }
    }
}
