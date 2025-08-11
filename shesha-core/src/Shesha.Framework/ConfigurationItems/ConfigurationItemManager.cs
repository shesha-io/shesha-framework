using Abp;
using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Exceptions;
using Shesha.ConfigurationItems.Models;
using Shesha.ConfigurationItems.New;
using Shesha.Domain;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Validations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Base class of the Configuration Item Manager
    /// </summary>
    public abstract class ConfigurationItemManager<TItem, TRevision> : AbpServiceBase, IConfigurationItemManager<TItem>
        where TItem : ConfigurationItem, new()
        where TRevision: ConfigurationItemRevision
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

        /// inheritedDoc
        public abstract Task<TItem> CopyAsync(TItem item, CopyItemInput input);

        public abstract Task<TItem> DuplicateAsync(TItem item);

        /// inheritedDoc
        public abstract Task<IConfigurationItemDto> MapToDtoAsync(TItem item);

        /// inheritedDoc
        public abstract Task<TItem> ExposeAsync(TItem item, Module module);
        

        /// inheritedDoc
        public async virtual Task MoveToModuleAsync(TItem item, MoveItemToModuleInput input)
        {
            var module = await ModuleRepository.GetAsync(input.ModuleId);

            var validationResults = new List<ValidationResult>();

            // todo: review validation messages, add localization support
            if (item == null)
                validationResults.Add(new ValidationResult("Please select an item to move", new List<string> { nameof(input.ItemId) }));
            if (module == null)
                validationResults.Add(new ValidationResult("Module is mandatory", new List<string> { nameof(input.ModuleId) }));
            if (module != null && item != null)
            {
                var alreadyExist = await Repository.GetAll().Where(f => f.Module == module && f.Name == item.Name && f != item).AnyAsync();
                if (alreadyExist)
                    validationResults.Add(new ValidationResult($"Item with name `{item.Name}` already exists in module `{module.Name}`")
                    );
            }

            validationResults.ThrowValidationExceptionIfAny(L);

            item.NotNull();

            item.Module = module;
            await Repository.UpdateAsync(item);
        }

        public abstract Task<TItem> CreateNewVersionAsync(TItem item);

        public virtual Task DeleteAllVersionsAsync(TItem item)
        {
            return Repository.DeleteAsync(f => f.Name == item.Name && f.Module == item.Module && !f.IsDeleted);
        }

        public async Task<ConfigurationItem> CopyAsync(ConfigurationItem item, CopyItemInput input)
        {
            return await CopyAsync((TItem)item, input);
        }

        public async Task<ConfigurationItem> DuplicateAsync(ConfigurationItem item)
        {
            return await DuplicateAsync((TItem)item);
        }

        public Task MoveToModuleAsync(ConfigurationItem item, MoveItemToModuleInput input)
        {
            return MoveToModuleAsync((TItem)item, input);
        }

        public async Task<ConfigurationItem> CreateNewVersionAsync(ConfigurationItem item)
        {
            return await CreateNewVersionAsync((TItem)item);
        }

        public Task DeleteAllVersionsAsync(ConfigurationItem item)
        {
            return DeleteAllVersionsAsync((TItem)item);
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