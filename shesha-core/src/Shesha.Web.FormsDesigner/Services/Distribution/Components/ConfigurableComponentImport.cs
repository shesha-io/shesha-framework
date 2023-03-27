using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Extensions;
using Shesha.Services.ConfigurationItems;
using Shesha.Web.FormsDesigner.Domain;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Web.FormsDesigner.Services.Distribution
{
    /// <summary>
    /// Configurable component import
    /// </summary>
    public class ConfigurableComponentImport: ConfigurationItemImportBase, IConfigurableComponentImport, ITransientDependency
    {
        private readonly IRepository<ConfigurableComponent, Guid> _componentRepo;
        private readonly IConfigurableComponentManager _componentManger;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public ConfigurableComponentImport(IRepository<Module, Guid> moduleRepo,
            IRepository<FrontEndApp, Guid> frontEndAppRepo,
            IConfigurableComponentManager componentManger, 
            IRepository<ConfigurableComponent, Guid> formConfigRepo, 
            IUnitOfWorkManager unitOfWorkManager): base(moduleRepo, frontEndAppRepo)
        {
            _componentManger = componentManger;
            _componentRepo = formConfigRepo;
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

        private async Task<ConfigurationItemBase> GetLiveVersionFor(DistributedConfigurableComponent item) 
        {
            var query = _componentRepo.GetAll().Where(f => f.Name == item.Name && f.VersionStatus == ConfigurationItemVersionStatus.Live);
            query = query.Where(!string.IsNullOrWhiteSpace(item.ModuleName) 
                ? f => f.Module.Name == item.ModuleName
                : f => f.Module == null
            );
            query = query.Where(!string.IsNullOrWhiteSpace(item.FrontEndApplication)
                ? f => f.Application.AppKey == item.FrontEndApplication
                : f => f.Application == null
            );

            return await query.FirstOrDefaultAsync();
        }

        /// inheritedDoc
        protected async Task<ConfigurationItemBase> ImportComponentAsync(DistributedConfigurableComponent item, IConfigurationItemsImportContext context)
        {
            // check if form exists
            var existingComponent = await _componentRepo.FirstOrDefaultAsync(f => f.Name == item.Name && 
                (f.Module == null && item.ModuleName == null || f.Module.Name == item.ModuleName) &&
                (f.Application == null && item.FrontEndApplication == null || f.Application.AppKey == item.FrontEndApplication) &&
                f.IsLast
            );

            // use status specified in the context with fallback to imported value
            var statusToImport = context.ImportStatusAs ?? item.VersionStatus;
            if (existingComponent != null) 
            {
                switch (existingComponent.VersionStatus) 
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
                    var liveVersion = existingComponent.VersionStatus == ConfigurationItemVersionStatus.Live
                        ? existingComponent
                        : await GetLiveVersionFor(item);

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
                newComponentVersion.VersionStatus = statusToImport;
                newComponentVersion.CreatedByImport = context.ImportResult;
                newComponentVersion.Normalize();

                // todo: save external Id
                // how to handle origin?

                await _componentRepo.UpdateAsync(newComponentVersion);

                return newComponentVersion;
            } else 
            {
                var newComponent = new ConfigurableComponent();
                MapToComponent(item, newComponent);

                // fill audit?
                newComponent.VersionNo = 1;
                newComponent.Module = await GetModuleAsync(item.ModuleName, context);
                newComponent.Application = await GetFrontEndAppAsync(item.FrontEndApplication, context);                

                // important: set status according to the context
                newComponent.VersionStatus = statusToImport;
                newComponent.CreatedByImport = context.ImportResult;

                newComponent.Normalize();

                await _componentRepo.InsertAsync(newComponent);

                return newComponent;
            }
        }

        private void MapToComponent(DistributedConfigurableComponent item, ConfigurableComponent component) 
        {
            component.Name = item.Name;
            component.Label = item.Label;
            component.Description = item.Description;
            component.VersionStatus = item.VersionStatus;
            component.Suppress = item.Suppress;

            component.Settings = item.Settings;
        }
    }
}
