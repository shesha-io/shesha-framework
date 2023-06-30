using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Shesha.Application.Services.Dto;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Cache;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Exceptions;
using Shesha.Utilities;
using Shesha.Web.FormsDesigner.Domain;
using Shesha.Web.FormsDesigner.Dtos;
using Shesha.Web.FormsDesigner.Exceptions;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services
{
    /// <summary>
    /// Configurable components application service
    /// </summary>
    public class ConfigurableComponentAppService : SheshaCrudServiceBase<ConfigurableComponent, ConfigurableComponentDto, Guid, FilteredPagedAndSortedResultRequestDto, CreateConfigurableComponentDto, UpdateConfigurableComponentDto, GetConfigurableComponentByIdInput>, IConfigurableComponentAppService
    {
        private readonly IRepository<Module, Guid> _moduleRepository;
        private readonly IRepository<FrontEndApp, Guid> _frontEndAppRepository;        
        private readonly IConfigurationFrameworkRuntime _cfRuntime;
        private readonly IConfigurationItemClientSideCache _clientSideCache;
        
        /// <summary>
        /// Default constructor
        /// </summary>
        public ConfigurableComponentAppService(
            IRepository<ConfigurableComponent, Guid> repository,
            IRepository<Module, Guid> moduleRepository,
            IRepository<FrontEndApp, Guid> frontEndAppRepository,
            IConfigurationFrameworkRuntime cfRuntime,
            IConfigurationItemClientSideCache clientSideCache) : base(repository)
        {
            _moduleRepository = moduleRepository;
            _frontEndAppRepository = frontEndAppRepository;
            _cfRuntime = cfRuntime;
            _clientSideCache = clientSideCache;
        }

        /// <summary>
        /// Get current component configuration by name
        /// </summary>
        /// <returns></returns>
        /// <exception cref="ConfigurableComponentNotFoundException"></exception>
        [HttpGet]
        public async Task<ConfigurableComponentDto> GetByNameAsync(GetConfigurableComponentByNameInput input) 
        {
            var mode = _cfRuntime.ViewMode;

            var appKey = input.IsApplicationSpecific ? _cfRuntime.FrontEndApplication : null;

            // check cache
            if (!string.IsNullOrWhiteSpace(input.Md5))
            {
                var cachedMd5 = await _clientSideCache.GetCachedMd5Async(ConfigurableComponent.ItemTypeName, appKey, input.Module, input.Name, mode);
                if (input.Md5 == cachedMd5)
                    throw new ContentNotModifiedException("Component not changed");
            }
            
            var component = await GetComponentAsync(new GetComponentInput { Module = input.Module, Name = input.Name, FrontEndApplication = appKey });
            
            if (component == null)
                throw new ConfigurableComponentNotFoundException(appKey, input.Module, input.Name);

            var dto = ObjectMapper.Map<ConfigurableComponentDto>(component);

            dto.CacheMd5 = GetMd5(dto);
            await _clientSideCache.SetCachedMd5Async(ConfigurableComponent.ItemTypeName, appKey, input.Module, input.Name, mode, dto.CacheMd5);

            return dto;
        }

        /// inheritedDoc
        [HttpPut]
        public async Task UpdateSettingsAsync(ConfigurableComponentUpdateSettingsInput input)
        {
            var appKey = input.IsApplicationSpecific ? _cfRuntime.FrontEndApplication : null;
            var component = await GetComponentAsync(new GetComponentInput { Module = input.Module, Name = input.Name, FrontEndApplication = appKey });

            if (component == null) 
            {
                component = new ConfigurableComponent {
                    
                };
                component.Name = input.Name;
                component.Module = await GetModuleAsync(input.Module);

                component.VersionNo = 1;
                component.VersionStatus = ConfigurationItemVersionStatus.Live;
                component.Origin = component;

                if (input.IsApplicationSpecific && !string.IsNullOrWhiteSpace(_cfRuntime.FrontEndApplication)) {
                    var application = await GetFrontEndAppAsync(_cfRuntime.FrontEndApplication);
                    if (application == null)
                        throw new FrontEndApplicationNotFoundException(_cfRuntime.FrontEndApplication);
                    
                    component.Application = application;
                }

                component.Normalize();

                await Repository.InsertAsync(component);
            }

            component.Settings = input.Settings;

            await Repository.UpdateAsync(component);
            await UnitOfWorkManager.Current.SaveChangesAsync();
        }

        #region private methods

        private async Task<ConfigurableComponent> GetComponentAsync(GetComponentInput input)
        {
            var mode = _cfRuntime.ViewMode;

            var moduleEntity = await GetModuleAsync(input.Module);

            // todo: move to a generic method
            var query = Repository.GetAll().Where(f => f.Module == moduleEntity &&
                f.Name == input.Name);

            if (!string.IsNullOrWhiteSpace(input.FrontEndApplication)) 
                query = query.Where(c => c.Application.AppKey == input.FrontEndApplication);

            switch (mode)
            {
                case ConfigurationItems.Models.ConfigurationItemViewMode.Live:
                    query = query.Where(f => f.VersionStatus == ConfigurationItemVersionStatus.Live);
                    break;
                case ConfigurationItems.Models.ConfigurationItemViewMode.Ready:
                    {
                        var statuses = new ConfigurationItemVersionStatus[] {
                        ConfigurationItemVersionStatus.Live,
                        ConfigurationItemVersionStatus.Ready
                    };

                        query = query.Where(f => statuses.Contains(f.VersionStatus)).OrderByDescending(f => f.VersionNo);
                        break;
                    }
                case ConfigurationItems.Models.ConfigurationItemViewMode.Latest:
                    {
                        var statuses = new ConfigurationItemVersionStatus[] {
                        ConfigurationItemVersionStatus.Live,
                        ConfigurationItemVersionStatus.Ready,
                        ConfigurationItemVersionStatus.Draft
                    };
                        query = query.Where(f => f.IsLast && statuses.Contains(f.VersionStatus));
                        break;
                    }
            }

            var component = await AsyncQueryableExecuter.FirstOrDefaultAsync(query);
            return component;
        }

        /// <summary>
        /// Ger module by name
        /// </summary>
        /// <param name="moduleName"></param>
        /// <returns></returns>
        private async Task<Module> GetModuleAsync(string moduleName)
        {
            return !string.IsNullOrWhiteSpace(moduleName)
                ? await AsyncQueryableExecuter.FirstOrDefaultAsync(_moduleRepository.GetAll().Where(m => m.Name == moduleName))
                : null;
        }

        private async Task<FrontEndApp> GetFrontEndAppAsync(string appKey)
        {
            return !string.IsNullOrWhiteSpace(appKey)
                ? await AsyncQueryableExecuter.FirstOrDefaultAsync(_frontEndAppRepository.GetAll().Where(m => m.AppKey == appKey))
                : null;
        }

        private string GetMd5(ConfigurableComponentDto dto)
        {
            var json = JsonConvert.SerializeObject(dto);
            return json.ToMd5Fingerprint();
        }

        #endregion

        public class GetComponentInput 
        {
            /// <summary>
            /// Module name
            /// </summary>
            public string Module { get; set; }

            /// <summary>
            /// Component name
            /// </summary>
            public string Name { get; set; }

            /// <summary>
            /// Application key
            /// </summary>
            public string FrontEndApplication { get; set; }
        }
    }
}
