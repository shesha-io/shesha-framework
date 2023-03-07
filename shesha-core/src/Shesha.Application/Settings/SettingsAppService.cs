using Abp.Configuration;
using Microsoft.AspNetCore.Mvc;
using Shesha.Settings.Dto;
using System.Threading.Tasks;

namespace Shesha.Settings
{
    /// <summary>
    /// Settings application service
    /// </summary>
    public class SettingsAppService : SheshaAppServiceBase
    {
        private readonly IShaSettingManager _settingProvider;

        public SettingsAppService(IShaSettingManager settingProvider)
        {
            _settingProvider = settingProvider;
        }

        /// <summary>
        /// Get setting value
        /// </summary>
        [HttpGet]
        public async Task<object> GetValue(GetSettingValueInput input)
        {
            var value = await _settingProvider.GetOrNullAsync(input.Module, input.Name, new SettingManagementContext { AppKey = input.AppKey });

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