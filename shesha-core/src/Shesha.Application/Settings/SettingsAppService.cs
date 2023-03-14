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

        public SettingsAppService(IShaSettingManager settingProvider, IConfigurationFrameworkRuntime cfRuntime)
        {
            _settingProvider = settingProvider;
            _cfRuntime = cfRuntime;
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
                var value = await _settingProvider.GetOrNullAsync(identifier.Module, identifier.Name);
                values.Add(identifier, value);
            }

            return values;
        }

        /// <summary>
        /// Get setting value
        /// </summary>
        [HttpGet]
        public async Task<object> GetValue(GetSettingValueInput input)
        {
            var appKey = !string.IsNullOrWhiteSpace(input.AppKey)
                ? input.AppKey
                : _cfRuntime.FrontEndApplication;
            var value = await _settingProvider.GetOrNullAsync(input.Module, input.Name, 
                new SettingManagementContext { 
                    AppKey = appKey
                });

            return value;
        }

        /// <summary>
        /// Update setting value
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task UpdateValue(UpdateSettingValueInput input)
        {
            await _settingProvider.SetAsync(input.Module, input.Name, input.Value, new SettingManagementContext { AppKey = input.AppKey });
        }
    }
}