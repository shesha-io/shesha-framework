using Abp;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Runtime.Session;
using Abp.Timing;
using Newtonsoft.Json;
using Shesha.ConfigurationItems.Distribution;
using Shesha.ConfigurationItems.Distribution.Exceptions;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Domain.Enums;
using Shesha.Dto;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Utilities;
using Shesha.Validations;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Base class of the Configuration Item Manager
    /// </summary>
    public abstract class ConfigurationItemManager<TItem> : AbpServiceBase, IConfigurationItemManager<TItem>
        where TItem : ConfigurationItem, new()
    {
        /// <summary>
        /// Configurable Item type supported by the current manager
        /// </summary>
        public Type ItemType => typeof(TItem);

        private string? _discriminator;
        public string Discriminator => _discriminator ?? (_discriminator = ConfigurationItemHelper.GetDiscriminator(ItemType));
        public IIocResolver IocResolver { get; set; }
        public IRepository<TItem, Guid> Repository { get; set; }
        public IRepository<ConfigurationItemRevision, Guid> RevisionRepository { get; set; }
        public IRepository<Module, Guid> ModuleRepository { get; set; }
        public IConfigurationItemHelper ConfigurationItemHelper { get; set; }
        public IModuleHierarchyProvider HierarchyProvider { get; set; }
        public IRepository<ConfigurationItemInheritance, string> InheritanceRepository { get; set; }
        public IAbpSession AbpSession { get; set; } = NullAbpSession.Instance;
        public IConfigurationFrameworkRuntime CfRuntime { get; set; }

        public ConfigurationItemManager()
        {
            LocalizationSourceName = SheshaConsts.LocalizationSourceName;
        }

        private async Task<string> GenerateItemDuplicateNameAsync(TItem item)
        {
            // ‘{original file name} – copy’
            var baseName = $"{item.Name} - copy";

            var existingNames = await Repository.GetAll()
                .Where(e => e.Name.StartsWith(baseName))
                .Select(e => e.Name)
                .ToListAsync();

            var maxCopyNumber = existingNames.Any()
                ? existingNames.Select(n =>
                    {
                        var suffix = n.Replace(baseName, "").Trim();
                        return string.IsNullOrWhiteSpace(suffix)
                            ? 1
                            : int.TryParse(suffix, out  var copyNo)
                                ? copyNo
                                : -1;
                    })
                    .MaxOrDefault(0)
                : 0;
            int? newNumber = maxCopyNumber > 0 
                ? maxCopyNumber + 1 
                : null;

            return $"{baseName}{newNumber}";
        }

        public virtual async Task<TItem> DuplicateAsync(TItem item) 
        {
            var newName = await GenerateItemDuplicateNameAsync(item);
            var duplicate = new TItem { 
                Module = item.Module,
                Application = item.Application,
                Folder = item.Folder,
                Name = newName,
            };
            await CopyItemPropertiesAsync(item, duplicate);

            duplicate.SurfaceStatus = null;
            duplicate.ExposedFrom = null;
            duplicate.ExposedFromRevision = null;
            duplicate.LatestImportedRevisionId = null;

            duplicate.Normalize();
            await Repository.InsertAsync(duplicate);

            await UnitOfWorkManager.Current.SaveChangesAsync();

            await AfterItemDuplicatedAsync(item, duplicate);

            return duplicate;
        }

        protected virtual Task AfterItemDuplicatedAsync(TItem item, TItem duplicate)
        {
            return Task.CompletedTask;
        }

        /// <summary>
        /// Copy value of custom properties from <paramref name="source"/> to <paramref name="destination"/>.
        /// Is used in Duplicate and Expose operations
        /// </summary>
        /// <param name="source">Source to copy custom properties from</param>
        /// <param name="destination">Destination to copy custom properties to</param>
        protected virtual Task CopyItemPropertiesAsync(TItem source, TItem destination)
        {
            destination.Label = source.Label;
            destination.Description = source.Description;

            return Task.CompletedTask;
        }

        /// inheritedDoc
        public virtual Task<IConfigurationItemDto> MapToDtoAsync(TItem item) 
        {
            var dto = new ConfigurationItemDto
            {
                Id = item.Id,
                Module = item.Module?.Name,
                Name = item.Name,
                Label = item.Label,
                Description = item.Description,
            };
            return Task.FromResult<IConfigurationItemDto>(dto);
        }

        /// inheritedDoc
        public virtual async Task<TItem> ExposeAsync(TItem item, Module module)
        {
            ArgumentNullException.ThrowIfNull(item.Module);

            using (CfRuntime.DisableConfigurationTracking())
            {
                var srcRevision = item.LatestRevision;

                var exposedConfig = new TItem
                {
                    Name = item.Name,
                    Module = module,
                    ExposedFrom = item,
                    ExposedFromRevision = srcRevision,
                    SurfaceStatus = RefListSurfaceStatus.Overridden,
                };
                await CopyItemPropertiesAsync(item, exposedConfig);
                await Repository.InsertAsync(exposedConfig);

                await SaveToRevisionAsync(exposedConfig, revision => { 
                    revision.Comments = $"Exposed from {item.Module.Name}";
                });

                await UnitOfWorkManager.Current.SaveChangesAsync();

                return exposedConfig;
            }            
        }

        public async Task<ConfigurationItem> DuplicateAsync(ConfigurationItem item)
        {
            return await DuplicateAsync((TItem)item);
        }

        public async Task<IConfigurationItemDto> MapToDtoAsync(ConfigurationItem item)
        {
            return await MapToDtoAsync((TItem)item);
        }

        public async Task<ConfigurationItem> ExposeAsync(ConfigurationItem item, Module module)
        {
            if (await ItemExistsAsync(item.Name, module))
                throw new ArgumentException($"{item.GetFriendlyClassName()} '{item.Name}' already exists in module '{module.Name}'");

            return await ExposeAsync((TItem)item, module);
        }

        public async Task<ConfigurationItem> ResolveItemAsync(string module, string name)
        {
            var actualItem = await InheritanceRepository.GetAll().Where(e => e.ItemType == Discriminator && e.ModuleName == module && e.Name == name)
                .OrderBy(e => e.ModuleLevel)
                .FirstOrDefaultAsync();

            if (actualItem == null)
                throw new ConfigurationItemNotFoundException(Discriminator, module, name, null);

            return await GetAsync(actualItem.ItemId);
        }

        public virtual async Task<TItem> CreateItemAsync(CreateItemInput input) 
        {
            var validationResults = new ValidationResults();
            var alreadyExist = await Repository.GetAll().Where(f => f.Module == input.Module && f.Name == input.Name).AnyAsync();
            if (alreadyExist)
                validationResults.Add($"Form with name `{input.Name}` already exists in module `{input.Module.Name}`");
            validationResults.ThrowValidationExceptionIfAny(L);

            var item = new TItem
            {
                Name = input.Name,
                Module = input.Module,
                Folder = input.Folder,
            };
            item.Origin = item;
            item.Description = input.Description;
            item.Label = input.Label;
            item.Normalize();

            await Repository.InsertAsync(item);

            await UnitOfWorkManager.Current.SaveChangesAsync();

            return item;
        }

        /// <summary>
        /// Creates a configuration item with additional data that can be used during creation process.
        /// This allows derived classes to pass additional data to HandleAdditionalPropertiesAsync without using temporary fields.
        /// </summary>
        /// <param name="input">Basic configuration item properties</param>
        /// <param name="additionalData">Additional data required by derived classes</param>
        /// <returns>Created configuration item</returns>
        public virtual async Task<TItem> CreateItemAsync(CreateItemInput input, object additionalData) 
        {
            var validationResults = new ValidationResults();
            var alreadyExist = await Repository.GetAll().Where(f => f.Module == input.Module && f.Name == input.Name).AnyAsync();
            if (alreadyExist)
                validationResults.Add($"Form with name `{input.Name}` already exists in module `{input.Module.Name}`");
            validationResults.ThrowValidationExceptionIfAny(L);

            var item = new TItem
            {
                Name = input.Name,
                Module = input.Module,
                Folder = input.Folder,
            };
            item.Origin = item;
            item.Description = input.Description;
            item.Label = input.Label;
            item.Normalize();

            // Allow derived classes to handle additional properties with the additional data
            await HandleAdditionalPropertiesAsync(item, additionalData);

            await Repository.InsertAsync(item);
            
            await UnitOfWorkManager.Current.SaveChangesAsync();

            return item;
        }
        
        /// <summary>
        /// Override this method in derived classes to handle additional properties from CreateItemInput with additional data
        /// </summary>
        /// <param name="item">The newly created item</param>
        /// <param name="additionalData">Additional data required for specialized item creation</param>
        /// <returns></returns>
        protected virtual Task HandleAdditionalPropertiesAsync(TItem item, object additionalData)
        {
            // By default, call the simpler overload
            return Task.CompletedTask;
        }

        async Task<ConfigurationItem> IConfigurationItemManager.CreateItemAsync(CreateItemInput input)
        {
            return await CreateItemAsync(input);
        }

        /// <summary>
        /// Checks existence of item with name <paramref name="name"/> in a module <paramref name="module"/>
        /// </summary>
        /// <param name="name">Item name</param>
        /// <param name="module">Module</param>
        /// <returns></returns>
        public Task<bool> ItemExistsAsync(string name, Module module)
        {
            return Repository.GetAll().AnyAsync(e => e.Name == name && e.Module == module);
        }

        protected Task CopyRevisionPropertiesBaseAsync(ConfigurationItemRevision srcRevision, ConfigurationItemRevision dstRevision)
        {
            dstRevision.Comments = srcRevision.Comments;
            dstRevision.ConfigHash = srcRevision.ConfigHash;

            return Task.CompletedTask;
        }

        public virtual Task<bool> CurrentUserHasAccessToAsync(string module, string name)
        {
            return Task.FromResult(true);
        }

        public virtual Task<string> GetCacheMD5Async(IConfigurationItemDto dto)
        {
            var json = JsonConvert.SerializeObject(dto);
            var md5 = json.ToMd5Fingerprint();
            return Task.FromResult(md5);
        }

        public async Task<ConfigurationItem> GetAsync(Guid id)
        {
            return await Repository.GetAsync(id);
        }

        /// <summary>
        /// Get configuration item by pair: module and name
        /// </summary>
        /// <param name="module">Module name</param>
        /// <param name="name">Item name</param>
        public async Task<ConfigurationItem> GetAsync(string module, string name) 
        {
            var item = await Repository.GetByByFullName(module, name).FirstOrDefaultAsync();
            if (item == null) {
                var itemType = ConfigurationItemHelper.GetDiscriminator(typeof(TItem));
                throw new ConfigurationItemNotFoundException(itemType, module, name, null);
            }                

            return item;
        }

        /// <summary>
        /// Dump current state of the configuration item to a revision
        /// </summary>
        public async Task<ConfigurationItemRevision> SaveToRevisionAsync(ConfigurationItem item, Action<ConfigurationItemRevision>? revisionCustomizer = null)
        {
            var exporter = IocResolver.GetItemExporter(ItemType);
            if (exporter == null)
                throw new ExporterNotFoundException(item.ItemType);

            var json = await exporter.ExportItemToJsonAsync(item);
            var configHash = json.ToMd5Fingerprint();

            var latestRevision = item.LatestRevision;
            if (latestRevision != null && latestRevision.ConfigHash == configHash)
                return latestRevision;

            var isNewRevision = NewRevisionRequired(item);
            var revision = isNewRevision
                ? item.MakeNewRevision(ConfigurationItemRevisionCreationMethod.Manual)
                : latestRevision.NotNull();

            revision.ConfigurationJson = json;
            revision.ConfigHash = configHash;

            revisionCustomizer?.Invoke(revision);

            if (isNewRevision)
                await RevisionRepository.InsertAsync(revision);
            else
                await RevisionRepository.UpdateAsync(revision);

            return revision;
        }
        private bool NewRevisionRequired(ConfigurationItem configurationItem)
        {
            /*
            A new version should automatically be created whenever one of the following occurs:
            1.	a new configuration item is imported from a package, 
            2.	a configuration change is made more than 15 minutes after the last recorded change
            3.	a configuration change is made by a user which is different from the user who made the previous configuration change, regardless of the time since the last change.
             */
            var newRevisionRequired = configurationItem.LatestRevision == null ||
                configurationItem.LatestRevision.CreationTime < Clock.Now.AddMinutes(-15) ||
                configurationItem.LatestRevision.CreatorUserId != AbpSession.UserId;
            return newRevisionRequired;
        }

        public async Task RestoreRevisionAsync(ConfigurationItemRevision revision)
        {
            revision.ConfigurationItem.Module?.EnsureEditable();

            if (revision == revision.ConfigurationItem.LatestRevision)
                return;

            var importer = IocResolver.GetItemImporter(ItemType);
            if (importer == null)
                throw new ImporterNotFoundException(revision.ConfigurationItem.ItemType);

            var distributedItem = await importer.ReadFromJsonAsync(revision.ConfigurationJson);

            await importer.ImportItemAsync(distributedItem, new PackageImportContext());
        }
    }
}