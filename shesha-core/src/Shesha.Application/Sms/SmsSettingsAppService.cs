using Abp.Authorization;
using Abp.Dependency;
using Abp.Reflection;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using Shesha.Reflection;
using Shesha.Sms.Configuration;
using Shesha.Sms.Dtos;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Sms
{
    [Obsolete("Use generic SettingsAppService instead")]
    [AbpAuthorize()]
    public class SmsSettingsAppService: SheshaAppServiceBase, ITransientDependency
    {
        private readonly ITypeFinder _typeFinder;
        private readonly ISmsSettings _settings;

        public SmsSettingsAppService(ITypeFinder typeFinder, ISmsSettings settings)
        {
            _typeFinder = typeFinder;
            _settings = settings;
        }


        [HttpGet, Route("api/Sms/Settings"), ApiVersion("1")]
        public async Task<SmsSettingsDto> GetSettings()
        {
            var settings = new SmsSettingsDto
            {
                Gateway = await _settings.SmsGateway.GetValueAsync(),
                RedirectAllMessagesTo = await _settings.RedirectAllMessagesTo.GetValueAsync(),
            };
            
            return settings;
        }

        [HttpPut, Route("api/Sms/Settings"), ApiVersion("1")]
        public async Task UpdateSettings(SmsSettingsDto input)
        {
            await _settings.SmsGateway.SetValueAsync(input.Gateway);
            await _settings.RedirectAllMessagesTo.SetValueAsync(input.RedirectAllMessagesTo);
        }

        [HttpGet, Route("api/v{version:apiVersion}/Sms/Settings"), ApiVersion("2")]
        public async Task<SmsSettingsV2Dto> GetSettingsV2()
        {
            var currentGatewayType = await GetCurrentGatewayType();

            var settings = new SmsSettingsV2Dto
            {
                Gateway = currentGatewayType != null ? SmsUtils.GetGatewayAlias(currentGatewayType) : null,
                RedirectAllMessagesTo = await _settings.RedirectAllMessagesTo.GetValueAsync(),
            };
            var gatewayTypes = _typeFinder.Find(t => !t.IsAbstract && typeof(ISmsGateway).IsAssignableFrom(t));
            foreach (var gatewayType in gatewayTypes) 
            {
                var gateway = IocManager.Resolve(gatewayType) as ISmsGateway;
                if (gateway.SettingsType == null)
                    continue;

                var gatewaySettings = await gateway.GetSettingsAsync();
                var gatewayAlias = SmsUtils.GetGatewayAlias(gateway.GetType());
                settings.Gateways[gatewayAlias] = gatewaySettings;
            }

            return settings;
        }
        
        [HttpPut, HttpPost, Route("api/v{version:apiVersion}/Sms/Settings"), ApiVersion("2")]
        public async Task UpdateSettingsV2(SmsSettingsV2Dto input)
        {
            var gatewayType = !string.IsNullOrWhiteSpace(input.Gateway)
                ? _typeFinder.Find(t => typeof(ISmsGateway).IsAssignableFrom(t) && SmsUtils.GetGatewayAlias(t) == input.Gateway).FirstOrDefault()
                : null;

            var gatewayUid = gatewayType?.GetClassUid();

            await _settings.SmsGateway.SetValueAsync(gatewayUid);
            await _settings.RedirectAllMessagesTo.SetValueAsync(input.RedirectAllMessagesTo);
            
            var gateway = gatewayType != null
                ? IocManager.Resolve(gatewayType) as ISmsGateway
                : null;

            if (gateway.SettingsType != null) 
            {
                var gatewayAlias = SmsUtils.GetGatewayAlias(gateway.GetType());
                var gatewaySettingsJson = input.Gateways[gatewayAlias] as JObject;
                
                var gatewaySettings = gatewaySettingsJson.ToObject(gateway.SettingsType);
                
                await gateway.SetSettingsAsync(gatewaySettings);
            }
        }

        private async Task<Type> GetCurrentGatewayType() 
        {
            var gatewayUid = await _settings.SmsGateway.GetValueAsync();

            var gatewayType = !string.IsNullOrWhiteSpace(gatewayUid)
                ? _typeFinder.Find(t => typeof(ISmsGateway).IsAssignableFrom(t) && t.GetClassUid() == gatewayUid).FirstOrDefault()
                : null;
            return gatewayType;
        }
    }
}
