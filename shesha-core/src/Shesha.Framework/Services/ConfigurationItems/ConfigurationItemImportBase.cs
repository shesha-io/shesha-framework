using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Newtonsoft.Json;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.Enums;
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
        public IConfigurationFrameworkRuntime CfRuntime { get; set; }

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
        where TItem : ConfigurationItem, new()
        where TDistributedItem : DistributedConfigurableItemBase
    {
        protected IRepository<TItem, Guid> Repository { get; private set; }
        public IRepository<ConfigurationItemRevision, Guid> RevisionRepository { get; set; }

        protected ConfigurationItemImportBase(
            IRepository<TItem, Guid> repository,
            IRepository<Module, Guid> moduleRepo, 
            IRepository<FrontEndApp, Guid> frontendAppRepo) : base(moduleRepo, frontendAppRepo)
        {
            Repository = repository;
        }

        /// <summary>
        /// Reads configuration item from json stream
        /// </summary>
        public virtual async Task<DistributedConfigurableItemBase> ReadFromJsonAsync(Stream jsonStream)
        {
            using (var reader = new StreamReader(jsonStream))
            {
                var json = await reader.ReadToEndAsync();

                return await ReadFromJsonAsync(json);
            }
        }

        /// <summary>
        /// Reads configuration item from json
        /// </summary>
        public virtual Task<DistributedConfigurableItemBase> ReadFromJsonAsync(string json) 
        {
            var result = !string.IsNullOrWhiteSpace(json)
                    ? JsonConvert.DeserializeObject<TDistributedItem>(json)
                    : null;

            if (result == null)
                throw new Exception($"Failed to read {typeof(TDistributedItem).FullName} from json");

            return Task.FromResult<DistributedConfigurableItemBase>(result);
        }

        /// <summary>
        /// Imports configuration item
        /// </summary>
        /// <param name="item">Item to import</param>
        /// <param name="context">Import context</param>
        /// <returns></returns>
        /// <exception cref="ArgumentNullException"></exception>
        /// <exception cref="NotSupportedException"></exception>
        public async Task<ConfigurationItem> ImportItemAsync(DistributedConfigurableItemBase item, IConfigurationItemsImportContext context)
        {
            if (item == null)
                throw new ArgumentNullException(nameof(item));

            if (!(item is TDistributedItem itemConfig))
                throw new NotSupportedException($"{this.GetType().FullName} supports only items of type {typeof(TDistributedItem).FullName}. Actual type is {item.GetType().FullName}");

            return await ImportAsync(itemConfig, context);
        }

        protected virtual async Task<TItem> ImportAsync(TDistributedItem distributedItem, IConfigurationItemsImportContext context) 
        {
            using (CfRuntime.DisableConfigurationTracking()) 
            {
                // check if form exists
                var item = await Repository.FirstOrDefaultAsync(f => f.Name == distributedItem.Name && (f.Module == null && distributedItem.ModuleName == null || f.Module != null && f.Module.Name == distributedItem.ModuleName));

                if (await SkipImportAsync(item, distributedItem))
                    return item;

                var isNew = item == null;
                if (item == null)
                {
                    item = new TItem
                    {
                        Module = await GetModuleAsync(distributedItem.ModuleName, context),
                        Application = await GetFrontEndAppAsync(distributedItem.FrontEndApplication, context),
                        Name = distributedItem.Name,
                    };
                }

                await MapStandardPropsToItemAsync(item, distributedItem);
                await MapCustomPropsToItemAsync(item, distributedItem);

                item.Normalize();
                if (isNew)
                    await Repository.InsertAsync(item);
                else
                    await Repository.UpdateAsync(item);

                var revision = item.MakeNewRevision(context.IsMigrationImport
                    ? ConfigurationItemRevisionCreationMethod.MigrationImport
                    : ConfigurationItemRevisionCreationMethod.ManualImport
                );
                revision.CreatedByImport = context.ImportResult;

                await RevisionRepository.InsertAsync(revision);

                item.LatestImportedRevisionId = revision.Id;
                await Repository.UpdateAsync(item);

                await AfterImportAsync(item, distributedItem, context);

                return item;
            }
        }

        protected virtual Task AfterImportAsync(TItem item, 
            TDistributedItem distributedItem,
            IConfigurationItemsImportContext context
        )
        {
            return Task.CompletedTask;
        }

        protected async Task<bool> SkipImportAsync(TItem? item, TDistributedItem distributedItem)
        {
            if (item == null)
                return false;

            var baseEquals = (item.Module == null ? string.IsNullOrWhiteSpace(distributedItem.ModuleName) : item.Module.Name == distributedItem.ModuleName) &&
                item.Name == distributedItem.Name &&
                item.Suppress == distributedItem.Suppress &&

                item.Label == distributedItem.Label &&
                item.Description == distributedItem.Description;
            if (!baseEquals)
                return false;

            return await CustomPropsAreEqualAsync(item, distributedItem);
        }

        protected abstract Task<bool> CustomPropsAreEqualAsync(TItem item, TDistributedItem distributedItem);

        protected Task MapStandardPropsToItemAsync(TItem item, TDistributedItem distributedItem) 
        {
            item.Suppress = distributedItem.Suppress;
            item.Label = distributedItem.Label;
            item.Description = distributedItem.Description;

            return Task.CompletedTask;
        }

        protected abstract Task MapCustomPropsToItemAsync(TItem item, TDistributedItem distributedItem);
    }    
}
