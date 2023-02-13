using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Web.FormsDesigner.Domain;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services.Distribution
{
    /// <summary>
    /// Configurable component import
    /// </summary>
    public class ConfigurableComponentImport: IConfigurableComponentImport, ITransientDependency
    {
        private readonly IRepository<ConfigurableComponent, Guid> _componentRepo;
        private readonly IRepository<ConfigurationItem, Guid> _configItemRepository;
        private readonly IRepository<Module, Guid> _moduleRepo;
        private readonly IRepository<FrontEndApp, Guid> _frontendAppRepo;
        private readonly IConfigurableComponentManager _componentManger;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public ConfigurableComponentImport(IConfigurableComponentManager componentManger, IRepository<ConfigurableComponent, Guid> formConfigRepo, IRepository<ConfigurationItem, Guid> configItemRepository, IRepository<Module, Guid> moduleRepo, IRepository<FrontEndApp, Guid> frontendAppRepo, IUnitOfWorkManager unitOfWorkManager)
        {
            _componentManger = componentManger;
            _componentRepo = formConfigRepo;
            _configItemRepository = configItemRepository;
            _moduleRepo = moduleRepo;
            _frontendAppRepo = frontendAppRepo;
            _unitOfWorkManager = unitOfWorkManager;
        }

        public string ItemType => ConfigurableComponent.ItemTypeName;

        /// inheritedDoc
        public async Task<ConfigurationItemBase> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context) 
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is DistributedConfigurableComponent formItem))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {nameof(DistributedConfigurableComponent)}. Actual type is {item.GetType().FullName}");

            return await ImportComponentAsync(formItem, context);
        }

        /// inheritedDoc
        public async Task<DistributedConfigurableItemBase> ReadFromJsonAsync(Stream jsonStream) 
        {
            using (var reader = new StreamReader(jsonStream))
            {
                var json = await reader.ReadToEndAsync();
                return JsonConvert.DeserializeObject<DistributedConfigurableComponent>(json);
            }
        }

        /// inheritedDoc
        protected async Task<ConfigurationItemBase> ImportComponentAsync(DistributedConfigurableComponent item, IConfigurationItemsImportContext context)
        {
            // check if form exists
            var existingComponent = await _componentRepo.FirstOrDefaultAsync(f => f.Configuration.Name == item.Name && 
                (f.Configuration.Module == null && item.ModuleName == null || f.Configuration.Module.Name == item.ModuleName) &&
                (f.Configuration.Application == null && item.FrontEndApplication == null || f.Configuration.Application.AppKey == item.FrontEndApplication) &&
                f.Configuration.IsLast
            );

            // use status specified in the context with fallback to imported value
            var statusToImport = context.ImportStatusAs ?? item.VersionStatus;
            if (existingComponent != null) 
            {
                switch (existingComponent.Configuration.VersionStatus) 
                {
                    case ConfigurationItemVersionStatus.Draft:
                    case ConfigurationItemVersionStatus.Ready: 
                    {
                        // cancel existing version
                        await _componentManger.CancelVersoinAsync(existingComponent);
                        break;
                    }
                }
                // mark existing live form as retired if we import new form as live
                if (statusToImport == ConfigurationItemVersionStatus.Live) 
                {
                    var liveVersion = existingComponent.Configuration.VersionStatus == ConfigurationItemVersionStatus.Live
                        ? existingComponent
                        : await _componentRepo.FirstOrDefaultAsync(f => f.Configuration.Name == item.Name && (f.Configuration.Module == null && item.ModuleName == null || f.Configuration.Module.Name == item.ModuleName) && f.Configuration.VersionStatus == ConfigurationItemVersionStatus.Live);
                    if (liveVersion != null)
                    {
                        await _componentManger.UpdateStatusAsync(liveVersion, ConfigurationItemVersionStatus.Retired);
                        await _unitOfWorkManager.Current.SaveChangesAsync(); // save changes to guarantee sequence of update
                    }
                }

                // create new version
                var newComponentVersion = await _componentManger.CreateNewVersionAsync(existingComponent);
                MapToComponent(item, newComponentVersion);

                // important: set status according to the context
                newComponentVersion.Configuration.VersionStatus = statusToImport;
                newComponentVersion.Configuration.CreatedByImport = context.ImportResult;
                newComponentVersion.Normalize();

                // todo: save external Id
                // how to handle origin?

                await _configItemRepository.UpdateAsync(newComponentVersion.Configuration);
                await _componentRepo.UpdateAsync(newComponentVersion);

                return newComponentVersion;
            } else 
            {
                var newComponent = new ConfigurableComponent();
                MapToComponent(item, newComponent);

                // fill audit?
                newComponent.Configuration.VersionNo = 1;
                newComponent.Configuration.Module = await GetModuleAsync(item.ModuleName, context);
                newComponent.Configuration.Application = await GetFrontEndAppAsync(item.FrontEndApplication, context);                

                // important: set status according to the context
                newComponent.Configuration.VersionStatus = statusToImport;
                newComponent.Configuration.CreatedByImport = context.ImportResult;

                newComponent.Normalize();

                await _configItemRepository.InsertAsync(newComponent.Configuration);
                await _componentRepo.InsertAsync(newComponent);
                

                return newComponent;
            }
        }

        private async Task<Module> GetModuleAsync(string name, IConfigurationItemsImportContext context) 
        {
            if (string.IsNullOrWhiteSpace(name))
                return null;

            var module = await _moduleRepo.FirstOrDefaultAsync(m => m.Name == name);
            if (module == null) 
            {
                if (context.CreateModules) 
                {
                    module = new Module { Name = name, IsEnabled = true };
                    await _moduleRepo.InsertAsync(module);
                } else
                    throw new NotSupportedException($"Module `{name}` is missing in the destination");
            }

            return module;
        }

        private async Task<FrontEndApp> GetFrontEndAppAsync(string appKey, IConfigurationItemsImportContext context)
        {
            if (string.IsNullOrWhiteSpace(appKey))
                return null;

            var application = await _frontendAppRepo.FirstOrDefaultAsync(m => m.AppKey == appKey);
            if (application == null)
            {
                if (context.CreateFrontEndApplications)
                {
                    application = new FrontEndApp { AppKey = appKey, Name = appKey };
                    await _frontendAppRepo.InsertAsync(application);
                }
                else
                    throw new NotSupportedException($"Front-end application `{appKey}` is missing in the destination");
            }

            return application;
        }

        private void MapToComponent(DistributedConfigurableComponent item, ConfigurableComponent component) 
        {
            component.Configuration.Name = item.Name;
            component.Configuration.Label = item.Label;
            component.Configuration.ItemType = item.ItemType;
            component.Configuration.Description = item.Description;
            component.Configuration.VersionStatus = item.VersionStatus;
            component.Configuration.Suppress = item.Suppress;

            component.Settings = item.Settings;
        }
    }
}
