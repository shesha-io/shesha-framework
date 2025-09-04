using Abp;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Dto;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Validations;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Base class of the Configuration Item Manager
    /// </summary>
    public abstract class ConfigurationItemManager<TItem, TRevision> : AbpServiceBase, IConfigurationItemManager<TItem>
        where TItem : ConfigurationItem<TRevision>, new()
        where TRevision: ConfigurationItemRevision, new()
    {
        /// <summary>
        /// Configurable Item type supported by the current manager
        /// </summary>
        public Type ItemType => typeof(TItem);

        private string? _discriminator;
        public string Discriminator => _discriminator ?? (_discriminator = ConfigurationItemHelper.GetDiscriminator(ItemType));
        public IRepository<TItem, Guid> Repository { get; set; }
        public IRepository<TRevision, Guid> RevisionRepository { get; set; }
        public IRepository<Module, Guid> ModuleRepository { get; set; }
        public IConfigurationItemHelper ConfigurationItemHelper { get; set; }
        public IConfigurationFrameworkRuntime CfRuntime { get; set; }
        public IModuleHierarchyProvider HierarchyProvider { get; set; }
        public IRepository<ConfigurationItemInheritance, string> InheritanceRepository { get; set; }

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

            var sourceRevision = item.LatestRevision;
            var duplicateRevision = duplicate.MakeNewRevision();

            // copy base properties
            await CopyRevisionPropertiesBaseAsync(sourceRevision, duplicateRevision);
            await CopyRevisionPropertiesAsync(sourceRevision, duplicateRevision);

            duplicateRevision.CreatedByImport = null;
            duplicateRevision.ParentRevision = null;
            
            await RevisionRepository.InsertAsync(duplicateRevision);

            await Repository.UpdateAsync(duplicate);

            await UnitOfWorkManager.Current.SaveChangesAsync();

            await AfterItemDuplicatedAsync(item, duplicate);

            return duplicate;
        }

        protected virtual Task AfterItemDuplicatedAsync(TItem item, TItem duplicate)
        {
            return Task.CompletedTask;
        }

        protected virtual Task CopyItemPropertiesAsync(TItem source, TItem destination)
        {
            return Task.CompletedTask;
        }

        /// <summary>
        /// Copy value of custom properties from <paramref name="source"/> to <paramref name="destination"/> revision.
        /// Is used in Duplicate and Expose operations
        /// </summary>
        /// <param name="source">Source revision to copy custom properties from</param>
        /// <param name="destination">Destination revision to copy custom properties to</param>
        /// <returns></returns>
        protected abstract Task CopyRevisionPropertiesAsync(TRevision source, TRevision destination);

        /// inheritedDoc
        public virtual Task<IConfigurationItemDto> MapToDtoAsync(TItem item) 
        {
            var revision = item.LatestRevision;

            var dto = new ConfigurationItemDto
            {
                Id = item.Id,
                ModuleId = item.Module?.Id,
                OriginId = item.Origin?.Id,
                Module = item.Module?.Name,
                Name = item.Name,
                Label = revision.Label,
                Description = revision.Description,
            };
            return Task.FromResult<IConfigurationItemDto>(dto);
        }

        /// inheritedDoc
        public virtual async Task<TItem> ExposeAsync(TItem item, Module module)
        {
            var srcRevision = item.LatestRevision;

            var exposedConfig = new TItem
            {
                Name = item.Name,
                Module = module,
                ExposedFrom = item,
                ExposedFromRevision = srcRevision,
                SurfaceStatus = Domain.Enums.RefListSurfaceStatus.Overridden,
            };
            await CopyItemPropertiesAsync(item, exposedConfig);
            await Repository.InsertAsync(exposedConfig);

            var exposedRevision = exposedConfig.MakeNewRevision();

            await CopyRevisionPropertiesBaseAsync(srcRevision, exposedRevision);
            await CopyRevisionPropertiesAsync(srcRevision, exposedRevision);
            exposedRevision.VersionNo = 1;
            exposedRevision.VersionName = null;

            await RevisionRepository.InsertAsync(exposedRevision);
            await Repository.UpdateAsync(exposedConfig);

            await UnitOfWorkManager.Current.SaveChangesAsync();

            return exposedConfig;
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

        public async Task<ConfigurationItem> GetItemAsync(string module, string name)
        {
            var actualItem = await InheritanceRepository.GetAll().Where(e => e.ItemType == Discriminator && e.ModuleName == module && e.Name == name)
                .OrderBy(e => e.ModuleLevel)
                .FirstOrDefaultAsync();

            if (actualItem == null)
                throw new ConfigurationItemNotFoundException(Discriminator, module, name, null);

            return await Repository.GetAsync(actualItem.ItemId);
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

            await Repository.InsertAsync(item);

            var revision = item.MakeNewRevision();
            revision.Description = input.Description;
            revision.Label = input.Label;
            
            // Allow derived classes to handle additional properties
            await HandleAdditionalPropertiesAsync(input, item, revision);
            
            item.Normalize();

            await RevisionRepository.InsertAsync(revision);

            await UnitOfWorkManager.Current.SaveChangesAsync();

            return item;
        }

        /// <summary>
        /// Override this method in derived classes to handle additional properties from CreateItemInput
        /// </summary>
        /// <param name="input">The create item input containing additional properties</param>
        /// <param name="item">The newly created configuration item</param>
        /// <param name="revision">The newly created revision</param>
        /// <returns></returns>
        protected virtual Task HandleAdditionalPropertiesAsync(CreateItemInput input, TItem item, TRevision revision)
        {
            // Base implementation does nothing - derived classes can override
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

        protected Task CopyRevisionPropertiesBaseAsync(TRevision srcRevision, TRevision dstRevision)
        {
            dstRevision.Label = srcRevision.Label;
            dstRevision.Description = srcRevision.Description;
            dstRevision.Comments = srcRevision.Comments;
            dstRevision.ConfigHash = srcRevision.ConfigHash;

            return Task.CompletedTask;
        }
    }
}