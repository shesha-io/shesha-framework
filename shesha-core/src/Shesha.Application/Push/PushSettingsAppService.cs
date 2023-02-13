using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Dependency;
using Microsoft.AspNetCore.Mvc;
using Shesha.Configuration;
using Shesha.Push.Dtos;

namespace Shesha.Push
{
    /// <summary>
    /// Push settings application service
    /// </summary>
    [AbpAuthorize()]
    [Route("api/Push/Settings")]
    public class PushSettingsAppService: SheshaAppServiceBase, ITransientDependency
    {
        /// <summary>
        /// Get push notifications settings
        /// </summary>
        /// <returns></returns>
        [HttpGet, Route("")]
        public async Task<PushSettingsDto> GetSettings()
        {
            var settings = new PushSettingsDto
            {
                PushNotifier = await GetSettingValueAsync(SheshaSettingNames.Push.PushNotifier),
            };
            
            return settings;
        }

        /// <summary>
        /// Update push notifications settings
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        [HttpPut, Route("")]
        public async Task UpdateSettings(PushSettingsDto input)
        {
            await ChangeSettingAsync(SheshaSettingNames.Push.PushNotifier, input.PushNotifier);
        }
    }
}
