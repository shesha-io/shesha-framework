using Abp.Dependency;
using Abp.Reflection;
using Shesha.Attributes;
using Shesha.Reflection;
using Shesha.Sms.Configuration;
using Shesha.Sms.Dtos;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Sms
{
    /// <summary>
    /// Factory that serves current <see cref="ISmsGateway"/>
    /// </summary>
    public class SmsGatewayFactory : ISmsGatewayFactory, ITransientDependency
    {
        private readonly ISmsSettings _smsSettings;
        private readonly IIocResolver _iocResolver;
        private readonly ITypeFinder _typeFinder;
        
        public SmsGatewayFactory(ISmsSettings smsSettings, ITypeFinder typeFinder, IIocResolver iocResolver)
        {
            _smsSettings = smsSettings;
            _typeFinder = typeFinder;
            _iocResolver = iocResolver;
        }

        public async Task<ISmsGateway> GetSmsGatewayAsync()
        {
            var settings = await _smsSettings.SmsSettings.GetValueOrNullAsync();
            if (settings == null)
                return NullSmsGateway.Instance;

            var gatewayUid = settings.SmsGateway;

            var gatewayType = !string.IsNullOrWhiteSpace(gatewayUid)
                ? GetSmsGatewayTypes().FirstOrDefault(e => e.Uid == gatewayUid)?.Type
                : null;

            var gateway = gatewayType != null
                ? _iocResolver.Resolve(gatewayType) as ISmsGateway
                : null;

            return gateway ?? NullSmsGateway.Instance;
        }

        public List<AvailableSmsGatewayInfo> GetSmsGatewayTypes() 
        {
            var result = new List<AvailableSmsGatewayInfo>();
            var gatewayTypes = _typeFinder.Find(t => typeof(ISmsGateway).IsAssignableFrom(t) && t.IsClass && _iocResolver.IsRegistered(t)).ToList();
            foreach (var gatewayType in gatewayTypes) 
            {
                var attribute = gatewayType.GetAttributeOrNull<ClassUidAttribute>();
                if (attribute == null)
                    continue;
                result.Add(new AvailableSmsGatewayInfo {
                    Type = gatewayType,
                    Uid = attribute.Uid,
                    Alias = SmsUtils.GetGatewayAlias(gatewayType),
                    Name = ReflectionHelper.GetDisplayName(gatewayType),
                    Description = ReflectionHelper.GetDescription(gatewayType)
                });                
            }
            return result;
        }
    }
}
