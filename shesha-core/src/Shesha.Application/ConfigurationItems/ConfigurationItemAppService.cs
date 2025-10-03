using Abp.Authorization;
using Shesha.ConfigurationItems.Cache;
using Shesha.ConfigurationItems.Dtos;
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
        private readonly IModuleManager _moduleManager;
        private readonly IConfigurationItemHelper _ciHelper;

        public ConfigurationItemAppService(
            IConfigurationItemClientSideCache clientSideCache,
            IModuleManager moduleManager,
            IConfigurationItemHelper ciHelper
        )
        {
            _clientSideCache = clientSideCache;
            _moduleManager = moduleManager;
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

            var resolvedItem = await manager.GetItemAsync(input.Module, input.Name);

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
    }
}
