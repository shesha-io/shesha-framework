using Abp.Runtime.Validation;
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

        private SettingManagementContext? GetContext(string? appKey, bool isUserSpecific)
        {
            return new SettingManagementContext
            {
                AppKey = !string.IsNullOrWhiteSpace(appKey) ? appKey : null,
                UserId = isUserSpecific ? AbpSession.UserId : null,
                TenantId = AbpSession.TenantId,
            };
        }

        private SettingIdentifier ResolveSettingId(SettingIdentifierDto input)
        {
            // Empty category means that setting is already resolved
            if (string.IsNullOrWhiteSpace(input.Category))
                return new SettingIdentifier(input.Name, input.Module);

            var resolvedDefinition = _settingDefinitionManager.GetAll().FirstOrDefault(s => s.ModuleAccessor == input.Module && s.CategoryAccessor == input.Category && s.Accessor == input.Name);
            if (resolvedDefinition == null)
                throw new AbpValidationException($"Setting not found ${input.Module}.${input.Category}.${input.Name}");

            return new SettingIdentifier(resolvedDefinition.Name, resolvedDefinition.ModuleName);
        }


        /// <summary>
        /// Get setting value
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<object?> GetValueAsync(GetSettingValueInput input)
        {
            var settingId = ResolveSettingId(input);

            var value = await _settingProvider.GetOrNullAsync(
                settingId.Module,
                settingId.Name,
                GetContext(input.AppKey, false)
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
            var settingId = ResolveSettingId(input);

            await _settingProvider.SetAsync(
                settingId.Module, // for backward compatibility (set value by Module/Name instead of ModuleAccessor/CategoryAccessor/Accessor)
                settingId.Name, // for backward compatibility (set value by Module/Name instead of ModuleAccessor/CategoryAccessor/Accessor)
                input.Value,
                GetContext(input.AppKey, false)
            );
        }

        /// <summary>
        /// Get user setting value
        /// </summary>
        [HttpPost]
        [SheshaAuthorize(RefListPermissionedAccess.AnyAuthenticated, IsConfigurable = false)]
        public async Task<object?> GetUserValueAsync(GetDynamicSettingValueInput input)
        {
            var value = await _settingProvider.UserSpecificGetOrNullAsync(
                input.Module,
                input.Name,
                input.Datatype,
                input.DefaultValue,
                GetContext(input.AppKey, true)
            );

            return value;
        }

        /// <summary>
        /// Update setting value
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpPost]
        [SheshaAuthorize(RefListPermissionedAccess.AnyAuthenticated, IsConfigurable = false)]
        public async Task UpdateUserValueAsync(UpdateDynamicSettingValueInput input)
        {
            await _settingProvider.UpdateUserSettingAsync(
                input.Module,
                input.Name,
                input.Datatype,
                input.Value,
                GetContext(input.AppKey, true)
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