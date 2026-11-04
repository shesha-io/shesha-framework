using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shesha.Authorization;
using Shesha.Domain.Enums;
using Shesha.Settings.Dto;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Settings
{
    /// <summary>
    /// Settings application service
    /// </summary>
    public class SettingsAppService : SheshaAppServiceBase
    {
        private readonly IShaSettingManager _settingProvider;
        private readonly ISettingDefinitionManager _settingDefinitionManager;

        public SettingsAppService(IShaSettingManager settingProvider, ISettingDefinitionManager settingDefinitionManager)
        {
            _settingProvider = settingProvider;
            _settingDefinitionManager = settingDefinitionManager;
        }

        /// <summary>
        /// Get setting values
        /// </summary>
        [HttpGet]
        public async Task<Dictionary<SettingIdentifier, object>> GetValuesAsync(GetSettingValuesInput input)
        {
            var distinctIds = input.Identifiers.Distinct().ToList();
            var values = new Dictionary<SettingIdentifier, object>();
            foreach (var identifier in distinctIds)
            {
                var value = await _settingProvider.GetJObjectOrNullAsync(identifier.Module, identifier.Name);
                values.Add(identifier, value);
            }

            return values;
        }

        private SettingManagementContext? GetContext(string? appKey)
        {
            return !string.IsNullOrWhiteSpace(appKey)
                ? new SettingManagementContext
                {
                    AppKey = appKey,
                    // TODO: recheck usage of UserId, looks like the condition for appKey is wrong
                    UserId = AbpSession.UserId
                }
                : null;
        }

        private SettingDefinition? ResolveSetting(SettingIdentifierDto input)
        {
            return _settingDefinitionManager.GetAll().FirstOrDefault(s => s.ModuleAccessor == input.Module && s.CategoryAccessor == input.Category && s.Accessor == input.Name);
        }

        /// <summary>
        /// Get setting value
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<object?> GetValueAsync(GetSettingValueInput input)
        {
            var settingDefinition = ResolveSetting(input);
            var value = await _settingProvider.GetOrNullAsync(
                settingDefinition?.ModuleName ?? input.Module, // for backward compatibility (get value by Module/Name instead of ModuleAccessor/CategoryAccessor/Accessor)
                settingDefinition?.Name ?? input.Name, // for backward compatibility (get value by Module/Name instead of ModuleAccessor/CategoryAccessor/Accessor)
                GetContext(input.AppKey)
            );

            return value;
        }

        /// <summary>
        /// Update setting value
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpPost]
        [SheshaAuthorize(RefListPermissionedAccess.RequiresPermissions, PermissionNames.Application_Configure, PermissionNames.Application_Settings, PermissionNames.Application_Maintenance, IsConfigurable = false)]
        public async Task UpdateValueAsync(UpdateSettingValueInput input)
        {
            var settingDefinition = ResolveSetting(input);
            await _settingProvider.SetAsync(
                settingDefinition?.ModuleName ?? input.Module, // for backward compatibility (set value by Module/Name instead of ModuleAccessor/CategoryAccessor/Accessor)
                settingDefinition?.Name ?? input.Name, // for backward compatibility (set value by Module/Name instead of ModuleAccessor/CategoryAccessor/Accessor)
                input.Value,
                GetContext(input.AppKey)
            );
        }

        /// <summary>
        /// Get user setting value
        /// </summary>
        [HttpPost]
        public async Task<object?> GetUserValueAsync(GetDynamicSettingValueInput input)
        {
            var settingDefinition = ResolveSetting(input);
            var value = await _settingProvider.UserSpecificGetOrNullAsync(
                settingDefinition?.ModuleName ?? input.Module, // for backward compatibility (set value by Module/Name instead of ModuleAccessor/CategoryAccessor/Accessor)
                settingDefinition?.Name ?? input.Name, // for backward compatibility (set value by Module/Name instead of ModuleAccessor/CategoryAccessor/Accessor)
                input.Datatype,
                input.DefaultValue,
                GetContext(input.AppKey)
            );

            return value;
        }

        /// <summary>
        /// Update setting value
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task UpdateUserValueAsync(UpdateDynamicSettingValueInput input)
        {
            var settingDefinition = ResolveSetting(input);
            await _settingProvider.UpdateUserSettingAsync(
                settingDefinition?.ModuleName ?? input.Module, // for backward compatibility (set value by Module/Name instead of ModuleAccessor/CategoryAccessor/Accessor)
                settingDefinition?.Name ?? input.Name, // for backward compatibility (set value by Module/Name instead of ModuleAccessor/CategoryAccessor/Accessor)
                input.Datatype,
                input.Value,
                GetContext(input.AppKey)
            );
        }

        [HttpGet]
        [SheshaAuthorize(RefListPermissionedAccess.RequiresPermissions, PermissionNames.Application_Configure, PermissionNames.Application_Settings, PermissionNames.Application_Maintenance, IsConfigurable = false)]
        public Task<List<SettingConfigurationDto>> GetConfigurationsAsync()
        {
            var settings = _settingDefinitionManager.GetAll();
            var result = settings.Select(s => new SettingConfigurationDto(s)).ToList();

            return Task.FromResult(result);
        }
    }
}