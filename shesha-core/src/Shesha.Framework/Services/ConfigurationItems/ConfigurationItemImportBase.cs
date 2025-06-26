using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Shesha.Services.ConfigurationItems
{
    /// <summary>
    /// Base class of the configuration item importer
    /// </summary>
    public abstract class ConfigurationItemImportBase
    {
        protected IRepository<Module, Guid> ModuleRepo { get; private set; }
        protected IRepository<FrontEndApp, Guid> FrontendAppRepo { get; private set; }
        public IUnitOfWorkManager UnitOfWorkManager { get; set; } = default!;

        public ConfigurationItemImportBase(IRepository<Module, Guid> _moduleRepo, IRepository<FrontEndApp, Guid> _frontendAppRepo)
        {
            ModuleRepo = _moduleRepo;
            FrontendAppRepo = _frontendAppRepo;
        }

        /// <summary>
        /// Get module by name
        /// </summary>
        /// <param name="name">Module name</param>
        /// <param name="context">Import context</param>
        /// <returns></returns>
        /// <exception cref="NotSupportedException"></exception>
        protected async Task<Module?> GetModuleAsync(string? name, IConfigurationItemsImportContext context)
        {
            if (string.IsNullOrWhiteSpace(name))
                return null;

            var module = await ModuleRepo.FirstOrDefaultAsync(m => m.Name == name);
            if (module == null)
            {
                if (context.CreateModules)
                {
                    module = new Module { Name = name, IsEnabled = true };
                    await ModuleRepo.InsertAsync(module);
                    await UnitOfWorkManager.Current.SaveChangesAsync();
                }
                else
                    throw new NotSupportedException($"Module `{name}` is missing");
            }

            return module;
        }

        /// <summary>
        /// Get front-end application by appKey
        /// </summary>
        /// <param name="appKey">AppKey of the front-end application</param>
        /// <param name="context">Import context</param>
        /// <returns></returns>
        /// <exception cref="NotSupportedException"></exception>
        protected async Task<FrontEndApp?> GetFrontEndAppAsync(string? appKey, IConfigurationItemsImportContext context)
        {
            if (string.IsNullOrWhiteSpace(appKey))
                return null;

            var application = await FrontendAppRepo.FirstOrDefaultAsync(m => m.AppKey == appKey);
            if (application == null)
            {
                if (context.CreateFrontEndApplications)
                {
                    application = new FrontEndApp { AppKey = appKey, Name = appKey };
                    await FrontendAppRepo.InsertAsync(application);
                }
                else
                    throw new NotSupportedException($"Front-end application `{appKey}` is missing");
            }

            return application;
        }

        public virtual Task<List<DistributedConfigurableItemBase>> SortItemsAsync(List<DistributedConfigurableItemBase> items)
        {
            return Task.FromResult(items);
        }
    }

    public abstract class ConfigurationItemImportBase<TItem, TDistributedItem> : ConfigurationItemImportBase 
        where TItem : ConfigurationItemBase
        where TDistributedItem : DistributedConfigurableItemBase
    {
        protected ConfigurationItemImportBase(IRepository<Module, Guid> _moduleRepo, IRepository<FrontEndApp, Guid> _frontendAppRepo) : base(_moduleRepo, _frontendAppRepo)
        {
        }

        public virtual async Task<DistributedConfigurableItemBase> ReadFromJsonAsync(Stream jsonStream)
        {
            using (var reader = new StreamReader(jsonStream))
            {
                var json = await reader.ReadToEndAsync();

                var result = !string.IsNullOrWhiteSpace(json)
                    ? JsonConvert.DeserializeObject<TDistributedItem>(json)
                    : null;

                if (result == null)
                    throw new Exception($"Failed to read {typeof(TDistributedItem).FullName} from json");

                return result;
            }
        }
    }
}
