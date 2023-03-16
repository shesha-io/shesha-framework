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
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Base class of the Configuration Item Manager
    /// </summary>
    public abstract class ConfigurationItemManager<TItem> : IConfigurationItemManager<TItem> where TItem : class, IConfigurationItem
    {
        /// <summary>
        /// Configurable Item type supported by the current manager
        /// </summary>
        public Type ItemType => typeof(TItem);

        protected IRepository<TItem, Guid> Repository { get; private set; }
        protected IRepository<Module, Guid> ModuleRepository { get; private set; }
        protected IUnitOfWorkManager UnitOfWorkManager { get; private set; }
        /// <summary>
        /// Reference to the object to object mapper.
        /// </summary>
        public IObjectMapper ObjectMapper { get; set; }

        public ConfigurationItemManager(IRepository<TItem, Guid> repository, IRepository<Module, Guid> moduleRepository, IUnitOfWorkManager unitOfWorkManager)
        {
            Repository = repository;
            ModuleRepository = moduleRepository;
            UnitOfWorkManager = unitOfWorkManager;
        }

        public virtual async Task UpdateStatusAsync(TItem item, ConfigurationItemVersionStatus status)
        {
            // todo: implement transition rules
            // todo: cover transition rules by unit tests

            // mark previously published version as retired
            if (status == ConfigurationItemVersionStatus.Live)
            {
                var liveVersionsQuery = Repository.GetAll().Where(v => v.Module == item.Module &&
                    v.Name == item.Name &&
                    v != item &&
                    v.VersionStatus == ConfigurationItemVersionStatus.Live);
                var liveVersions = await liveVersionsQuery.ToListAsync();

                foreach (var version in liveVersions)
                {
                    version.VersionStatus = ConfigurationItemVersionStatus.Retired;
                    await Repository.UpdateAsync(version);
                }

                await UnitOfWorkManager.Current.SaveChangesAsync();
            }

            item.VersionStatus = status;
            await Repository.UpdateAsync(item);
        }

        /// inheritedDoc
        public abstract Task<TItem> CopyAsync(TItem item, CopyItemInput input);

        /// inheritedDoc
        public abstract Task<IConfigurationItemDto> MapToDtoAsync(TItem item);

        /// inheritedDoc
        public virtual async Task CancelVersoinAsync(TItem item) 
        {
            item.VersionStatus = ConfigurationItemVersionStatus.Cancelled;
            await Repository.UpdateAsync(item);
        }

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

            if (validationResults.Any())
                throw new AbpValidationException("Please correct the errors and try again", validationResults);

            var allVersionsQuery = Repository.GetAll().Where(v => v.Origin == item.Origin);
            var allVersions = await allVersionsQuery.ToListAsync();

            foreach (var version in allVersions)
            {
                version.Module = module;
                await Repository.UpdateAsync(version);
            }
        }

        public abstract Task<TItem> CreateNewVersionAsync(TItem item);

        public virtual async Task DeleteAllVersionsAsync(TItem item)
        {
            await Repository.DeleteAsync(f => f.Name == item.Name && f.Module == item.Module && !f.IsDeleted);
        }

        public Task UpdateStatusAsync(ConfigurationItemBase item, ConfigurationItemVersionStatus status)
        {
            throw new NotImplementedException();
        }

        public Task<ConfigurationItemBase> CopyAsync(ConfigurationItemBase item, CopyItemInput input)
        {
            throw new NotImplementedException();
        }

        public Task CancelVersoinAsync(ConfigurationItemBase item)
        {
            throw new NotImplementedException();
        }

        public Task MoveToModuleAsync(ConfigurationItemBase item, MoveItemToModuleInput input)
        {
            throw new NotImplementedException();
        }

        public Task<ConfigurationItemBase> CreateNewVersionAsync(ConfigurationItemBase item)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAllVersionsAsync(ConfigurationItemBase item)
        {
            throw new NotImplementedException();
        }

        public Task<IConfigurationItemDto> MapToDtoAsync(ConfigurationItemBase item)
        {
            throw new NotImplementedException();
        }

        #region abstraction layer



        #endregion
    }
}
