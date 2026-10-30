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
    /// The selected gateway is not cached: <see cref="GetSmsGatewayAsync"/> and
    /// <see cref="GetCurrentGatewayInfoAsync"/> read settings on every call.
    /// </remarks>
    public class SmsGatewayFactory : ISmsGatewayFactory, ITransientDependency
    {
        private static readonly object GatewayTypesLock = new object();
        private static List<AvailableSmsGatewayInfo> _gatewayTypes;

        private readonly ISmsSettings _smsSettings;
        private readonly IIocResolver _iocResolver;
        private readonly ITypeFinder _typeFinder;

        /// <summary>
        /// Creates the factory.
        /// </summary>
        /// <param name="smsSettings">SMS settings. Read asynchronously on each lookup.</param>
        /// <param name="typeFinder">Type scanner. Invoked once per process to discover gateways.</param>
        /// <param name="iocResolver">Resolves concrete gateways and releases them.</param>
        public SmsGatewayFactory(ISmsSettings smsSettings, ITypeFinder typeFinder, IIocResolver iocResolver)
        {
            _smsSettings = smsSettings;
            _typeFinder = typeFinder;
            _iocResolver = iocResolver;
        }

        /// <summary>
        /// Releases a gateway returned by <see cref="GetSmsGatewayAsync"/> back to Windsor.
        /// </summary>
        /// <param name="gateway">
        /// Instance previously returned by <see cref="GetSmsGatewayAsync"/>.
        /// Null and <see cref="NullSmsGateway.Instance"/> are ignored because they are not container-owned.
        /// A transient gateway resolved for a configured uid is released, including a container-created <see cref="NullSmsGateway"/>.
        /// </param>
        public void ReleaseGateway(ISmsGateway gateway)
        {
            if (gateway == null || ReferenceEquals(gateway, NullSmsGateway.Instance))
                return;

            _iocResolver.Release(gateway);
        }

        /// <summary>
        /// Drops the process-wide gateway type catalogue so the next lookup scans again.
        /// </summary>
        internal static void ClearGatewayTypeCache()
        {
            lock (GatewayTypesLock)
                _gatewayTypes = null;
        }

        /// <summary>
        /// Gets the gateway currently selected in SMS settings.
        /// </summary>
        /// <returns>
        /// The resolved gateway, or <see cref="NullSmsGateway.Instance"/> when none is configured.
        /// The caller must pass the result to <see cref="ReleaseGateway"/>.
        /// </returns>
        public async Task<ISmsGateway> GetSmsGatewayAsync()
        {
            var info = await GetCurrentGatewayInfoAsync();
            if (info?.Type == null)
                return NullSmsGateway.Instance;

            var resolved = _iocResolver.Resolve(info.Type);
            if (resolved is ISmsGateway gateway)
                return gateway;

            _iocResolver.Release(resolved);
            return NullSmsGateway.Instance;
        }

        /// <summary>
        /// Gets the catalogue entry for the gateway currently selected in SMS settings.
        /// </summary>
        /// <returns>
        /// The catalogue entry, or null when settings are missing, the uid is blank, or the uid is unknown.
        /// Does not resolve a gateway.
        /// </returns>
        public async Task<AvailableSmsGatewayInfo> GetCurrentGatewayInfoAsync()
        {
            var settings = await _smsSettings.SmsSettings.GetValueOrNullAsync();
            if (settings == null || string.IsNullOrWhiteSpace(settings.SmsGateway))
                return null;

            return GetCachedGatewayTypes().FirstOrDefault(e => e.Uid == settings.SmsGateway);
        }

        /// <summary>
        /// Gets a copy of the cached gateway catalogue.
        /// </summary>
        /// <returns>Registered gateways. The list is a copy; the items are the cached entries.</returns>
        public List<AvailableSmsGatewayInfo> GetSmsGatewayTypes()
        {
            return GetCachedGatewayTypes().ToList();
        }

        /// <summary>
        /// Returns the process-wide catalogue, scanning types once.
        /// </summary>
        /// <returns>The cached catalogue. Callers must not mutate the list.</returns>
        private List<AvailableSmsGatewayInfo> GetCachedGatewayTypes()
        {
            lock (GatewayTypesLock)
            {
                if (_gatewayTypes == null)
                    _gatewayTypes = DiscoverGatewayTypes();

                return _gatewayTypes;
            }
        }

        /// <summary>
        /// Scans registered <see cref="ISmsGateway"/> implementations that have a <see cref="ClassUidAttribute"/>.
        /// </summary>
        /// <returns>The discovered catalogue.</returns>
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
        /// <param name="gatewayType">Gateway class to inspect.</param>
        /// <returns>The settings type, or null when the class does not declare one.</returns>
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
