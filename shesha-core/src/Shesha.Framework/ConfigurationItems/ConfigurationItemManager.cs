using Abp;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.ConfigurationItems.Models;
using Shesha.ConfigurationItems.New;
using Shesha.Domain;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Reflection;
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
                // OrderIndex = !!!
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
            duplicateRevision.Description = sourceRevision.Description;
            duplicateRevision.Label = sourceRevision.Label;

            // TODO: map revision properties            
            await CopyRevisionPropertiesAsync(sourceRevision, duplicateRevision);

            duplicateRevision.CreatedByImport = null;
            duplicateRevision.ParentRevision = null;
            
            await RevisionRepository.InsertAsync(duplicateRevision);

            await Repository.UpdateAsync(duplicate);

            await UnitOfWorkManager.Current.SaveChangesAsync();

            return duplicate;
        }

        protected virtual Task CopyItemPropertiesAsync(TItem source, TItem destination)
        {
            return Task.CompletedTask;
        }

        /// <summary>
        /// Copy value of custom properties from <paramref name="source"/> to <paramref name="destination"/> revision.
        /// Is used in Duplicate operation
        /// </summary>
        /// <param name="source">Source revision to copy custom properties from</param>
        /// <param name="destination">Destination revision to copy custom properties to</param>
        /// <returns></returns>
        protected abstract Task CopyRevisionPropertiesAsync(TRevision source, TRevision destination);

        /// inheritedDoc
        public abstract Task<IConfigurationItemDto> MapToDtoAsync(TItem item);

        /// inheritedDoc
        public abstract Task<TItem> ExposeAsync(TItem item, Module module);
        
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

        public abstract Task<TItem> CreateItemAsync(CreateItemInput input);

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
    }
}