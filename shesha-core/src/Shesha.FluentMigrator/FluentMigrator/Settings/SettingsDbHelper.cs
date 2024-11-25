using FluentMigrator;
using System.Data;

namespace Shesha.FluentMigrator.Settings
{
    internal class SettingsDbHelper: DbHelperBase
    {
        public const string SettingConfigurationTypeName = "setting-configuration";

        public SettingsDbHelper(DbmsType dbmsType, IDbConnection connection, IDbTransaction transaction, IQuerySchema querySchema) : base(dbmsType, connection, transaction, querySchema)
        {
        }

        internal Guid InsertSettingConfiguration(string module, string name, string displayName, string dataType, string? dataFormat)
        {
            if (string.IsNullOrWhiteSpace(module))
                throw new ArgumentNullException($"`{nameof(module)}` is mandatory", nameof(module));
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentNullException($"`{nameof(name)}` is mandatory", nameof(name));

            var id = Guid.NewGuid();

            // get module by name
            var moduleId = GetOrCreateModuleId(module);
            if (moduleId == null)
                throw new SheshaMigrationException($"Failed to get or create module with name `{module}`");

            ExecuteNonQuery($@"INSERT INTO ""Frwk_ConfigurationItems""
           (""Id""
           ,""CreationTime""
           ,""IsDeleted""
           ,""Label""
           ,""Name""
           ,""VersionNo""
           ,""VersionStatusLkp""
           ,""ItemType""
           ,""IsLast""
           ,""OriginId""
           ,""Suppress""
           ,""ModuleId""
		   )
     VALUES
           (@id
           ,@creationTime
           ,{BitOrBool(false)}
           ,@label
           ,@name
           ,1
           ,3 /*Live*/
           ,@itemType
           ,{BitOrBool(true)}
           ,@id
           ,{BitOrBool(false)}
           ,@moduleId
           )", command =>
            {
                command.AddParameter("@id", id);
                command.AddParameter("@creationTime", DateTime.Now);                
                command.AddParameter("@label", displayName);
                command.AddParameter("@name", name);
                command.AddParameter("@itemType", SettingConfigurationTypeName);
                command.AddParameter("@moduleId", moduleId);
            });

            var isUserSpecificExists = QuerySchema.ColumnExists(null, "Frwk_SettingConfigurations", "IsUserSpecific");
            var clientAccessLkpExists = QuerySchema.ColumnExists(null, "Frwk_SettingConfigurations", "ClientAccessLkp");

            ExecuteNonQuery($@"INSERT INTO ""Frwk_SettingConfigurations""
           (""Id""
           ,""DataType""
           ,""DataFormat""
           ,""OrderIndex""
           ,""IsClientSpecific""
           ,""AccessModeLkp""
           {(isUserSpecificExists ? ",\"IsUserSpecific\"" : "")}
           {(clientAccessLkpExists ? ",\"ClientAccessLkp\"" : "")}
            )
     VALUES
           (@id
           ,@dataType
           ,@dataFormat
           ,0
           ,{BitOrBool(false)}
           ,1/*BackEndOnly*/
           {(isUserSpecificExists ? $",{BitOrBool(false)}" : "")}
           {(clientAccessLkpExists ? ",3/*Full*/" : "")}
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
            var sql = $@"select 
	ci.""Id"" 
from 
	""Frwk_SettingConfigurations"" sc
	inner join ""Frwk_ConfigurationItems"" ci on ci.""Id"" = sc.""Id""
    left join ""Frwk_Modules"" m on m.""Id"" = ci.""ModuleId""
where 
	ci.""Name"" = @name
    and m.""Name"" = @moduleName
    and ci.""IsLast"" = {BitOrBool(true)}";

            return ExecuteScalar<Guid?>(sql, command =>
            {
                command.AddParameter("@name", name);
                command.AddParameter("@moduleName", module);
            });
        }

        internal void UpdateSettingDescription(Guid id, string description)
        {
            ExecuteNonQuery("update \"Frwk_ConfigurationItems\" set \"Description\" = @Description where \"Id\" = @Id", command => {
                command.AddParameter("@Description", description);
                command.AddParameter("@Id", id);
            });
        }

        internal void UpdateDisplayName(Guid id, string displayName)
        {
            if (displayName != null && displayName.Length > 300)
                throw new ArgumentException("DisplayName must be 300 character length maximum");

            ExecuteNonQuery("update \"Frwk_ConfigurationItems\" set \"Label\" = @Label where \"Id\" = @Id", command => {
                command.AddParameter("@Label", displayName);
                command.AddParameter("@Id", id);
            });
        }

        internal void UpdateCategory(Guid id, string category)
        {
            if (category != null && category.Length > 200)
                throw new ArgumentException("Category must be 200 character length maximum");

            ExecuteNonQuery("update \"Frwk_SettingConfigurations\" set \"Category\" = @Category where \"Id\" = @Id", command => {
                command.AddParameter("@Category", category);
                command.AddParameter("@Id", id);
            });
        }
        
        internal void UpdateIsUserSpecific(Guid id, bool isUserSpecific)
        {
            ExecuteNonQuery("update \"Frwk_SettingConfigurations\" set \"IsUserSpecific\" = @IsUserSpecific where \"Id\" = @Id", command => {
                command.AddParameter("@IsUserSpecific", isUserSpecific);
                command.AddParameter("@Id", id);
            });
        }

        internal void UpdateClientAccess(Guid id, UserSettingAccessMode clientAccess)
        {
            ExecuteNonQuery("update \"Frwk_SettingConfigurations\" set \"ClientAccessLkp\" = @clientAccess where \"Id\" = @Id", command => {
                command.AddParameter("@clientAccess", clientAccess);
                command.AddParameter("@Id", id);
            });
        }

        internal void UpdateIsClientSpecific(Guid id, bool isClientSpecific)
        {
            ExecuteNonQuery("update \"Frwk_SettingConfigurations\" set \"IsClientSpecific\" = @IsClientSpecific where \"Id\" = @Id", command => {
                command.AddParameter("@IsClientSpecific", isClientSpecific);
                command.AddParameter("@Id", id);
            });
        }

        internal void UpdateAccessMode(Guid id, SettingAccessMode accessMode)
        {
            ExecuteNonQuery("update \"Frwk_SettingConfigurations\" set \"AccessModeLkp\" = @accessMode where \"Id\" = @Id", command => {
                command.AddParameter("@accessMode", accessMode);
                command.AddParameter("@Id", id);
            });
        }

        internal void UpdateEditForm(Guid id, ConfigurationItemIdentifier formId)
        {
            ExecuteNonQuery("update \"Frwk_SettingConfigurations\" set \"EditorFormModule\" = @EditorFormModule, \"EditorFormName\" = @EditorFormName where \"Id\" = @Id", command => {
                command.AddParameter("@EditorFormModule", formId?.Module);
                command.AddParameter("@EditorFormName", formId?.Name);
                command.AddParameter("@Id", id);
            });
        }

        internal void UpdateReferenceList(Guid id, ConfigurationItemIdentifier refListId)
        {
            ExecuteNonQuery("update \"Frwk_SettingConfigurations\" set \"ReferenceListModule\" = @ReferenceListModule, \"ReferenceListName\" = @ReferenceListName where \"Id\" = @Id", command => {
                command.AddParameter("@ReferenceListModule", refListId?.Module);
                command.AddParameter("@ReferenceListName", refListId?.Name);
                command.AddParameter("@Id", id);
            });
        }

        internal void DeleteSettingDefinition(Guid id) 
        {
            ExecuteNonQuery("delete from \"Frwk_SettingValues\" where \"SettingConfigurationId\" = @Id", command => {
                command.AddParameter("@Id", id);
            });
            ExecuteNonQuery("delete from \"Frwk_SettingConfigurations\" where \"Id\" = @Id", command => {
                command.AddParameter("@Id", id);
            });
            ExecuteNonQuery("delete from \"Frwk_ConfigurationItems\" where \"Id\" = @Id", command => {
                command.AddParameter("@Id", id);
            });
        }

        internal Guid? GetSettingValueId(Guid settingId) 
        {
            var sql = @"select ""Id"" from ""Frwk_SettingValues"" where ""SettingConfigurationId"" = @settingId and ""ApplicationId"" is null";
            return ExecuteScalar<Guid?>(sql, command =>
            {
                command.AddParameter("@settingId", settingId);
            });
        }

        internal Guid? GetSettingValueId(Guid settingId, Guid? appId, long? userId)
        {
            var userIdExists = QuerySchema.ColumnExists(null, "Frwk_SettingValues", "UserId");
            var sql = $@"select 
	                        ""Id"" 
                        from 
	                        ""Frwk_SettingValues""
                        where 
	                        ""SettingConfigurationId"" = @settingId
                            and ((@appId is null and ""ApplicationId"" is null or (""ApplicationId"" = @appId)))
                            {(userIdExists ? "and ((@userId is null and \"UserId\" is null or (\"ApplicationId\" = @userId)))" : "")}
            ";

            return ExecuteScalar<Guid?>(sql, command =>
            {
                command.AddParameter("@settingId", settingId);
                command.AddParameter("@appId", appId);
                if (userIdExists)
                    command.AddParameter("@userId", userId);
            });
        }

        internal void UpdateSettingValue(Guid settingId, Guid? appId, long? userId, string? value)
        {
            var valueId = GetSettingValueId(settingId, appId, userId);
            if (valueId != null)
            {
                UpdateSettingValueById(valueId.Value, value);
            }
            else
            {
                CreateSettingValue(settingId, appId, value);
            }
        }

        internal void UpdateSettingValueById(Guid valueId, string? value) 
        {
            ExecuteNonQuery("update \"Frwk_SettingValues\" set \"Value\" = @value where \"Id\" = @valueId", command => {
                command.AddParameter("@valueId", valueId);
                command.AddParameter("@value", value);
            });
        }

        private void CreateSettingValue(Guid settingId, Guid? appId, string? value) 
        {
            var id = Guid.NewGuid();

            var sql = @"insert into 
	""Frwk_SettingValues""
	(""Id"", ""CreationTime"", ""Value"", ""SettingConfigurationId"", ""ApplicationId"")
values
	(@Id, @CreationTime, @Value, @SettingConfigurationId, @ApplicationId)";

            ExecuteNonQuery(sql, command => {
                command.AddParameter("@Id", id);
                command.AddParameter("@CreationTime", DateTime.Now);
                command.AddParameter("@Value", value);
                command.AddParameter("@SettingConfigurationId", settingId);
                command.AddParameter("@ApplicationId", appId);
            });
        }
    }
}
