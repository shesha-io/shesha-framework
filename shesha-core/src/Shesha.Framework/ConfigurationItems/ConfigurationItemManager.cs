using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.ObjectMapping;
using Abp.Runtime.Validation;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Base class of the Configuration Item Manager
    /// </summary>
    public abstract class ConfigurationItemManager<TItem> : IConfigurationItemManager<TItem> where TItem : class, IConfigurationItem
    {
        protected IRepository<TItem, Guid> Repository { get; private set; }
        protected IRepository<ConfigurationItem, Guid> ConfigurationItemRepository { get; private set; }
        protected IRepository<Module, Guid> ModuleRepository { get; private set; }
        protected IUnitOfWorkManager UnitOfWorkManager { get; private set; }
        /// <summary>
        /// Reference to the object to object mapper.
        /// </summary>
        public IObjectMapper ObjectMapper { get; set; }

        public abstract string ItemType { get; }

        public ConfigurationItemManager(IRepository<TItem, Guid> repository, IRepository<ConfigurationItem, Guid> configurationItemRepository, IRepository<Module, Guid> moduleRepository, IUnitOfWorkManager unitOfWorkManager)
        {
            Repository = repository;
            ConfigurationItemRepository = configurationItemRepository;
            ModuleRepository = moduleRepository;
            UnitOfWorkManager = unitOfWorkManager;
        }

        public virtual async Task UpdateStatusAsync(ConfigurationItemBase item, ConfigurationItemVersionStatus status)
        {
            // todo: implement transition rules
            // todo: cover transition rules by unit tests

            // mark previously published version as retired
            if (status == ConfigurationItemVersionStatus.Live)
            {
                var liveVersionsQuery = Repository.GetAll().Where(v => v.Configuration.Module == item.Configuration.Module &&
                    v.Configuration.Name == item.Configuration.Name &&
                    v != item &&
                    v.Configuration.VersionStatus == ConfigurationItemVersionStatus.Live);
                var liveVersions = await liveVersionsQuery.ToListAsync();

                foreach (var version in liveVersions)
                {
                    version.Configuration.VersionStatus = ConfigurationItemVersionStatus.Retired;
                    await ConfigurationItemRepository.UpdateAsync(version.Configuration);
                }

                await UnitOfWorkManager.Current.SaveChangesAsync();
            }

            item.Configuration.VersionStatus = status;
            await ConfigurationItemRepository.UpdateAsync(item.Configuration);
        }

        /// inheritedDoc
        public abstract Task<ConfigurationItemBase> CopyAsync(ConfigurationItemBase item, CopyItemInput input);

        /// inheritedDoc
        public abstract Task<IConfigurationItemDto> MapToDtoAsync(ConfigurationItemBase item);

        /// inheritedDoc
        public virtual async Task CancelVersoinAsync(ConfigurationItemBase item) 
        {
            item.Configuration.VersionStatus = ConfigurationItemVersionStatus.Cancelled;
            await ConfigurationItemRepository.UpdateAsync(item.Configuration);
        }

        /// inheritedDoc
        public async virtual Task MoveToModuleAsync(ConfigurationItemBase item, MoveItemToModuleInput input)
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
                var alreadyExist = await Repository.GetAll().Where(f => f.Configuration.Module == module && f.Configuration.Name == item.Configuration.Name && f != item).AnyAsync();
                if (alreadyExist)
                    validationResults.Add(new ValidationResult($"Item with name `{item.Configuration.Name}` already exists in module `{module.Name}`")
                    );
            }

            if (validationResults.Any())
                throw new AbpValidationException("Please correct the errors and try again", validationResults);

            var allVersionsQuery = Repository.GetAll().Where(v => v.Configuration.Origin == item.Configuration.Origin);
            var allVersions = await allVersionsQuery.ToListAsync();

            foreach (var version in allVersions)
            {
                version.Configuration.Module = module;
                await ConfigurationItemRepository.UpdateAsync(version.Configuration);
            }
        }

        public abstract Task<ConfigurationItemBase> CreateNewVersionAsync(ConfigurationItemBase item);

        public virtual async Task DeleteAllVersionsAsync(ConfigurationItemBase item)
        {
            await ConfigurationItemRepository.DeleteAsync(f => f.Name == item.Configuration.Name && f.Module == item.Configuration.Module && f.ItemType == item.Configuration.ItemType && !f.IsDeleted);
        }
    }
}
