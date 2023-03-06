using Abp.Authorization;
using Abp.Dependency;
using Microsoft.AspNetCore.Mvc;
using Shesha.Push.Configuration;
using Shesha.Push.Dtos;
using System;
using System.Threading.Tasks;

namespace Shesha.Push
{
    /// <summary>
    /// Push settings application service
    /// </summary>
    [Obsolete("Use generic SettingsAppService instead")]
    [AbpAuthorize()]
    [Route("api/Push/Settings")]
    public class PushSettingsAppService: SheshaAppServiceBase, ITransientDependency
    {
        private readonly IPushSettings _settings;

        public PushSettingsAppService(IPushSettings settings)
        {
            _settings = settings;
        }

        /// <summary>
        /// Get push notifications settings
        /// </summary>
        /// <returns></returns>
        [HttpGet, Route("")]
        public async Task<PushSettingsDto> GetSettings()
        {
            var settings = new PushSettingsDto
            {
                PushNotifier = await _settings.PushNotifier.GetValueAsync(),
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
            await _settings.PushNotifier.SetValueAsync(input.PushNotifier);            
        }
    }
}
