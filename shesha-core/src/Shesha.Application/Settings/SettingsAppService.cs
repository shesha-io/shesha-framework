using Abp.Runtime.Session;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shesha.ConfigurationItems;
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
        private readonly IConfigurationFrameworkRuntime _cfRuntime;
        private readonly ISettingDefinitionManager _settingDefinitionManager;

        public SettingsAppService(IShaSettingManager settingProvider, IConfigurationFrameworkRuntime cfRuntime, ISettingDefinitionManager settingDefinitionManager)
        {
            _settingProvider = settingProvider;
            _cfRuntime = cfRuntime;
            _settingDefinitionManager = settingDefinitionManager;
        }

        /// <summary>
        /// Get setting values
        /// </summary>
        [HttpGet]
        public async Task<Dictionary<SettingIdentifier, object>> GetValues(GetSettingValuesInput input)
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

        /// <summary>
        /// Get setting value
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<object> GetValue(GetSettingValueInput input)
        {
            var value = await _settingProvider.GetOrNullAsync(input.Module, input.Name, !string.IsNullOrWhiteSpace(input.AppKey) ?
                new SettingManagementContext
                {
                    AppKey = input.AppKey,
                    UserId = AbpSession.UserId
                } : null);

            return value;
        }

        /// <summary>
        /// Get user setting value
        /// </summary>
        [HttpPost]
        public async Task<object> GetUserValue(GetDynamicSettingValueInput input)
        {
            var value = await _settingProvider.UserSpecificGetOrNullAsync(input.Module, input.Name, input.Datatype, input.DefaultValue, !string.IsNullOrWhiteSpace(input.AppKey) ?
                new SettingManagementContext
                {
                    AppKey = input.AppKey,
                    UserId = AbpSession.UserId
                } : null);

            return value;
        }

        /// <summary>
        /// Update setting value
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task UpdateUserValue(UpdateDynamicSettingValueInput input)
        {
            await _settingProvider.UpdateUserSettingAsync(input.Module, input.Name, input.Datatype, input.Value, !string.IsNullOrWhiteSpace(input.AppKey) ?
                new SettingManagementContext
                {
                    AppKey = input.AppKey,
                    UserId = AbpSession.UserId
                } : null);
        }


        /// <summary>
        /// Update setting value
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task UpdateValue(UpdateSettingValueInput input)
        {
            await _settingProvider.SetAsync(input.Module, input.Name, input.Value, !string.IsNullOrWhiteSpace(input.AppKey) ?
                new SettingManagementContext
                {
                    AppKey = input.AppKey,
                    UserId = AbpSession.UserId
                } : null);
        }

        [HttpGet]
        [AllowAnonymous]
        public Task<List<SettingConfigurationDto>> GetConfigurationsAsync()
        {
            var settings = _settingDefinitionManager.GetAll();
            var result = settings.Select(s => new SettingConfigurationDto(s)).ToList();

            return Task.FromResult(result);
        }
    }
}