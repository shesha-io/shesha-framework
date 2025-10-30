using Abp.Authorization;
using Abp.Events.Bus;
using Shesha.ConfigurationItems.Cache;
using Shesha.ConfigurationItems.Dtos;
using Shesha.ConfigurationItems.Events;
using Shesha.Exceptions;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Common Configuration Item application service
    /// </summary>
    public class ConfigurationItemAppService: SheshaAppServiceBase
    {
        private readonly IConfigurationItemClientSideCache _clientSideCache;
        private readonly IConfigurationItemHelper _ciHelper;

        public ConfigurationItemAppService(
            IConfigurationItemClientSideCache clientSideCache,
            IConfigurationItemHelper ciHelper
        )
        {
            _clientSideCache = clientSideCache;
            _ciHelper = ciHelper;
        }

        public async Task<GetCurrentResponse> GetCurrentAsync(GetCurrentRequest input)
        {
            // check cache
            if (!string.IsNullOrWhiteSpace(input.Md5))
            {
                var cachedMd5 = await _clientSideCache.GetCachedMd5Async(input.ItemType, null, input.Module, input.Name);
                if (input.Md5 == cachedMd5)
                    throw new ContentNotModifiedException("Not changed");
            }

            var manager = _ciHelper.GetManager(input.ItemType);

            var resolvedItem = await manager.ResolveItemAsync(input.Module, input.Name);

            var hasAccess = await manager.CurrentUserHasAccessToAsync(input.Module, input.Name);
            if (!hasAccess)
                throw new AbpAuthorizationException("You are not authorized to access the requested configuration.");

            var dto = await manager.MapToDtoAsync(resolvedItem);

            var cacheMd5 = await manager.GetCacheMD5Async(dto);

            // TODO: handle top level module
            // TODO: handle applicaiton key
            await _clientSideCache.SetCachedMd5Async(input.ItemType, null, input.Module, input.Name, cacheMd5);

            return new GetCurrentResponse {
                Configuration = dto,
                CacheMd5 = cacheMd5,                
            };
        }

        public async Task<GetCurrentResponse> GetAsync(GetConfigurationRequest input) 
        {
            if (!string.IsNullOrWhiteSpace(input.Md5))
            {
                var cachedMd5 = await _clientSideCache.GetCachedMd5Async(input.ItemType, input.Id);
                if (input.Md5 == cachedMd5)
                    throw new ContentNotModifiedException("Not changed");
            }

            var manager = _ciHelper.GetManager(input.ItemType);

            var item = await manager.GetAsync(input.Id);

            var hasAccess = await manager.CurrentUserHasAccessToAsync(item.Module?.Name ?? string.Empty, item.Name);
            if (!hasAccess)
                throw new AbpAuthorizationException("You are not authorized to access the requested configuration.");

            var dto = await manager.MapToDtoAsync(item);

            var cacheMd5 = await manager.GetCacheMD5Async(dto);

            await _clientSideCache.SetCachedMd5Async(input.ItemType, input.Id, cacheMd5);

            return new GetCurrentResponse
            {
                Configuration = dto,
                CacheMd5 = cacheMd5,
            };
        }


        public Task TriggerConfigurationChangedEventAsync(TriggerConfigurationChangedEventRequest  request)
        {
            var bus = IocManager.Resolve<IEventBus>();
            var data = new ConfigurationStateUpdatedEventData(
                request.ConfigurationType,
                request.ModuleName,
                request.ItemName
            );
            bus.Trigger(data);

            return Task.CompletedTask;
        }
        public class TriggerConfigurationChangedEventRequest 
        {
            /// <summary>
            /// Type of configuration that was updated (form, reflist etc.)
            /// </summary>
            public string ConfigurationType { get; init; }

            /// <summary>
            /// Module name configuration belongs to
            /// </summary>
            public string ModuleName { get; init; }

            /// <summary>
            /// Configuration name
            /// </summary>
            public string ItemName { get; init; }
        }
    }
}
