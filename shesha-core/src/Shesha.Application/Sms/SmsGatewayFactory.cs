using Abp.Dependency;
using Abp.Reflection;
using Shesha.Attributes;
using Shesha.Reflection;
using Shesha.Sms.Configuration;
using Shesha.Sms.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Sms
{
    /// <summary>
    /// Factory that serves the current <see cref="ISmsGateway"/>.
    /// </summary>
    /// <remarks>
    /// Gateway type discovery is cached for the process the first time it is needed.
    /// The cache is shared by every instance and is safe for concurrent callers.
    /// The selected gateway is not cached: <see cref="GetSmsGatewayAsync"/> reads settings on every call.
    /// </remarks>
    public class SmsGatewayFactory : ISmsGatewayFactory, ITransientDependency
    {
        private static readonly object GatewayTypesLock = new object();
        private static readonly object ObservedGatewayLock = new object();
        private static List<AvailableSmsGatewayInfo> _gatewayTypes;
        private static string _observedGatewayUid;

        private readonly ISmsSettings _smsSettings;
        private readonly IIocResolver _iocResolver;
        private readonly ITypeFinder _typeFinder;

        public SmsGatewayFactory(ISmsSettings smsSettings, ITypeFinder typeFinder, IIocResolver iocResolver)
        {
            _smsSettings = smsSettings;
            _typeFinder = typeFinder;
            _iocResolver = iocResolver;
        }

        /// <summary>
        /// Releases a gateway resolved by <see cref="GetSmsGatewayAsync"/>.
        /// </summary>
        internal void ReleaseGateway(ISmsGateway gateway)
        {
            if (gateway != null && !ReferenceEquals(gateway, NullSmsGateway.Instance))
                _iocResolver.Release(gateway);
        }

        /// <summary>
        /// Drops the process-wide gateway catalogue and the last observed gateway uid.
        /// </summary>
        internal static void ClearGatewayTypeCache()
        {
            lock (GatewayTypesLock)
                _gatewayTypes = null;

            lock (ObservedGatewayLock)
                _observedGatewayUid = null;
        }

        /// <summary>
        /// Settings type of the gateway uid last observed by <see cref="GetSmsGatewayAsync"/>,
        /// looked up in the cached catalogue. Returns null when settings have not been read yet,
        /// when no gateway is configured, or when the uid is unknown. Does not read settings or block.
        /// </summary>
        internal Type GetCachedSettingsType()
        {
            string uid;
            lock (ObservedGatewayLock)
                uid = _observedGatewayUid;

            if (string.IsNullOrWhiteSpace(uid))
                return null;

            return GetCachedGatewayTypes().FirstOrDefault(g => g.Uid == uid)?.SettingsType;
        }

        public async Task<ISmsGateway> GetSmsGatewayAsync()
        {
            var settings = await _smsSettings.SmsSettings.GetValueOrNullAsync();
            if (settings == null || string.IsNullOrWhiteSpace(settings.SmsGateway))
            {
                ObserveGatewayUid(null);
                return NullSmsGateway.Instance;
            }

            var info = GetCachedGatewayTypes().FirstOrDefault(e => e.Uid == settings.SmsGateway);
            ObserveGatewayUid(info == null ? null : settings.SmsGateway);

            var gateway = info?.Type != null
                ? _iocResolver.Resolve(info.Type) as ISmsGateway
                : null;

            return gateway ?? NullSmsGateway.Instance;
        }

        public List<AvailableSmsGatewayInfo> GetSmsGatewayTypes()
        {
            return GetCachedGatewayTypes().ToList();
        }

        private List<AvailableSmsGatewayInfo> GetCachedGatewayTypes()
        {
            lock (GatewayTypesLock)
            {
                if (_gatewayTypes == null)
                    _gatewayTypes = DiscoverGatewayTypes();

                return _gatewayTypes;
            }
        }

        private static void ObserveGatewayUid(string gatewayUid)
        {
            lock (ObservedGatewayLock)
                _observedGatewayUid = gatewayUid;
        }

        private List<AvailableSmsGatewayInfo> DiscoverGatewayTypes()
        {
            var result = new List<AvailableSmsGatewayInfo>();
            var gatewayTypes = _typeFinder.Find(t =>
                t != null
                && t != typeof(DelegatingSmsGateway)
                && typeof(ISmsGateway).IsAssignableFrom(t)
                && t.IsClass
                && _iocResolver.IsRegistered(t)) ?? Array.Empty<Type>();

            foreach (var gatewayType in gatewayTypes)
            {
                var attribute = gatewayType.GetAttributeOrNull<ClassUidAttribute>();
                if (attribute == null || string.IsNullOrWhiteSpace(attribute.Uid))
                    continue;

                result.Add(new AvailableSmsGatewayInfo
                {
                    Type = gatewayType,
                    Uid = attribute.Uid,
                    Alias = SmsUtils.GetGatewayAlias(gatewayType),
                    Name = ReflectionHelper.GetDisplayName(gatewayType),
                    Description = ReflectionHelper.GetDescription(gatewayType),
                    SettingsType = GetSettingsType(gatewayType)
                });
            }

            return result;
        }

        /// <summary>
        /// Reads the settings CLR type from <see cref="ConfigurableSmsGateway{TSettings}"/> or
        /// <see cref="IConfigurableSmsGateway{TSettings}"/> without creating an instance.
        /// </summary>
        private static Type GetSettingsType(Type gatewayType)
        {
            for (var current = gatewayType; current != null && current != typeof(object); current = current.BaseType)
            {
                if (current.IsGenericType && current.GetGenericTypeDefinition() == typeof(ConfigurableSmsGateway<>))
                    return current.GetGenericArguments()[0];
            }

            foreach (var implemented in gatewayType.GetInterfaces())
            {
                if (implemented.IsGenericType && implemented.GetGenericTypeDefinition() == typeof(IConfigurableSmsGateway<>))
                    return implemented.GetGenericArguments()[0];
            }

            return null;
        }
    }
}
