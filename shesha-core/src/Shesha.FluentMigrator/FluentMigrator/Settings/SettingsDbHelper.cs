using System.Data;

namespace Shesha.FluentMigrator.Settings
{
    internal class SettingsDbHelper: DbHelperBase
    {
        public const string SettingConfigurationTypeName = "setting-configuration";

        public SettingsDbHelper(IDbConnection connection, IDbTransaction transaction) : base(connection, transaction)
        {
        }

        internal Guid InsertSettingConfiguration(string module, string name, string displayName, string dataType, string? dataFormat)
        {
            var id = Guid.NewGuid();

            // get module by name
            var moduleId = GetOrCreateModuleId(module);

            ExecuteNonQuery(@"INSERT INTO Frwk_ConfigurationItems
           (Id
           ,CreationTime
           ,IsDeleted
           ,Label
           ,Name
           ,VersionNo
           ,VersionStatusLkp
           ,ItemType
           ,IsLast
           ,OriginId
           ,Suppress
           ,ModuleId
		   )
     VALUES
           (@id
           ,getdate()
           ,0
           ,@label
           ,@name
           ,1
           ,3 /*Live*/
           ,@itemType
           ,1
           ,@id
           ,0
           ,@moduleId
           )", command =>
            {
                command.AddParameter("@id", id);
                command.AddParameter("@label", displayName);
                command.AddParameter("@name", name);
                command.AddParameter("@itemType", SettingConfigurationTypeName);
                command.AddParameter("@moduleId", moduleId);
            });

            ExecuteNonQuery(@"INSERT INTO Frwk_SettingConfigurations
           (Id
           ,DataType
           ,DataFormat
           ,OrderIndex
           ,IsClientSpecific
           ,AccessModeLkp
            )
     VALUES
           (@id
           ,@dataType
           ,@dataFormat
           ,0
           ,0
           ,1/*BackEndOnly*/
           )", command =>
            {
                command.AddParameter("@id", id);
                command.AddParameter("@dataType", dataType);
                command.AddParameter("@dataFormat", dataFormat);
            });

            return id;
        }

        internal Guid? GetSettingId(string module, string name) 
        {
            var sql = @"select 
	ci.Id 
from 
	Frwk_SettingConfigurations sc
	inner join Frwk_ConfigurationItems ci on ci.Id = sc.Id
    left join Frwk_Modules m on m.Id = ci.ModuleId
where 
	ci.Name = @name
    and m.Name = @moduleName
    and ci.IsLast = 1";

            return ExecuteScalar<Guid?>(sql, command =>
            {
                command.AddParameter("@name", name);
                command.AddParameter("@moduleName", module);
            });
        }

        internal void UpdateSettingDescription(Guid id, string description)
        {
            ExecuteNonQuery("update Frwk_ConfigurationItems set Description = @Description where Id = @Id", command => {
                command.AddParameter("@Description", description);
                command.AddParameter("@Id", id);
            });
        }

        internal void UpdateDisplayName(Guid id, string displayName)
        {
            if (displayName != null && displayName.Length > 300)
                throw new ArgumentException("DisplayName must be 300 character length maximum");

            ExecuteNonQuery("update Frwk_ConfigurationItems set Label = @Label where Id = @Id", command => {
                command.AddParameter("@Label", displayName);
                command.AddParameter("@Id", id);
            });
        }

        internal void UpdateCategory(Guid id, string category)
        {
            if (category != null && category.Length > 200)
                throw new ArgumentException("Category must be 200 character length maximum");

            ExecuteNonQuery("update Frwk_SettingConfigurations set Category = @Category where Id = @Id", command => {
                command.AddParameter("@Category", category);
                command.AddParameter("@Id", id);
            });
        }

        internal void UpdateIsClientSpecific(Guid id, bool isClientSpecific)
        {
            ExecuteNonQuery("update Frwk_SettingConfigurations set IsClientSpecific = @IsClientSpecific where Id = @Id", command => {
                command.AddParameter("@IsClientSpecific", isClientSpecific);
                command.AddParameter("@Id", id);
            });
        }

        internal void UpdateAccessMode(Guid id, SettingAccessMode accessMode)
        {
            ExecuteNonQuery("update Frwk_SettingConfigurations set AccessModeLkp = @accessMode where Id = @Id", command => {
                command.AddParameter("@accessMode", accessMode);
                command.AddParameter("@Id", id);
            });
        }

        internal void UpdateEditForm(Guid id, ConfigurationItemIdentifier formId)
        {
            ExecuteNonQuery("update Frwk_SettingConfigurations set EditorFormModule = @EditorFormModule, EditorFormName = @EditorFormName where Id = @Id", command => {
                command.AddParameter("@EditorFormModule", formId?.Module);
                command.AddParameter("@EditorFormName", formId?.Name);
                command.AddParameter("@Id", id);
            });
        }

        internal void UpdateReferenceList(Guid id, ConfigurationItemIdentifier refListId)
        {
            ExecuteNonQuery("update Frwk_SettingConfigurations set ReferenceListModule = @ReferenceListModule, ReferenceListName = @ReferenceListName where Id = @Id", command => {
                command.AddParameter("@ReferenceListModule", refListId?.Module);
                command.AddParameter("@ReferenceListName", refListId?.Name);
                command.AddParameter("@Id", id);
            });
        }

        internal void DeleteSettingDefinition(Guid id) 
        {
            ExecuteNonQuery("delete from Frwk_SettingValues where SettingConfigurationId = @Id", command => {
                command.AddParameter("@Id", id);
            });
            ExecuteNonQuery("delete from Frwk_SettingConfigurations where Id = @Id", command => {
                command.AddParameter("@Id", id);
            });
            ExecuteNonQuery("delete from Frwk_ConfigurationItems where Id = @Id", command => {
                command.AddParameter("@Id", id);
            });
        }
    }
}
