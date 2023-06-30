using FluentMigrator;
using Shesha.FluentMigrator;

namespace Shesha.Migrations.PostgreSql
{
    [Migration(20230623122399), PostgreSqlOnly]
    public class M20230623122399 : OneWayMigration
    {
        public override void Up()
        {
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.Core_EntityHistoryItem.sql");

            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.Core_AddEntityHistoryEvents.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.Core_AddSingleEntityHistoryEvent.sql");

            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.vw_Core_AreasHierarchyItems.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.vw_Core_AreasTreeItem.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.vw_Core_CheckListTreeItems.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.vw_Core_EntityHistoryItems.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.vw_Core_ReferenceListItemvalues.sql");

            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.log_Frwk_UserLoginAttempts_UpdateLastLoginDate_AI.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.trg_Frwk_UserLoginAttempts_UpdateLastLoginDate_AI.sql");
                       
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.log_Core_Persons_UpdateContacts_AU.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.trg_Core_Persons_UpdateContacts_AU.sql");

            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.log_Frwk_ConfigurationItems_UpdateIsLast_AD.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.log_Frwk_ConfigurationItems_UpdateIsLast_AI.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.log_Frwk_ConfigurationItems_UpdateIsLast_AU.sql");

            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.trg_Frwk_ConfigurationItems_UpdateIsLast_AD.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.trg_Frwk_ConfigurationItems_UpdateIsLast_AI.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.trg_Frwk_ConfigurationItems_UpdateIsLast_AU.sql");

            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.log_Frwk_StoredFileVersions_UpdateIsLast_AD.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.log_Frwk_StoredFileVersions_UpdateIsLast_AI.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.log_Frwk_StoredFileVersions_UpdateIsLast_AU.sql");

            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.trg_Frwk_StoredFileVersions_UpdateIsLast_AD.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.trg_Frwk_StoredFileVersions_UpdateIsLast_AI.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.trg_Frwk_StoredFileVersions_UpdateIsLast_AU.sql");

            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.log_Frwk_VersionedFieldVersions_UpdateIsLast_AD.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.log_Frwk_VersionedFieldVersions_UpdateIsLast_AI.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.log_Frwk_VersionedFieldVersions_UpdateIsLast_AU.sql");
    
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.trg_Frwk_VersionedFieldVersions_UpdateIsLast_AD.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.trg_Frwk_VersionedFieldVersions_UpdateIsLast_AI.sql");
            Execute.EmbeddedScript("Shesha.Migrations.PostgreSql.InitialScripts.trg_Frwk_VersionedFieldVersions_UpdateIsLast_AU.sql");
        }
    }
}
