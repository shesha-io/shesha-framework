using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.ObjectMapping;
using Abp.Runtime.Validation;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Reflection;
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
    public abstract class ConfigurationItemManager<TItem> : IConfigurationItemManager<TItem> where TItem : ConfigurationItemBase
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
        public IObjectMapper ObjectMapper { get; set; } = NullObjectMapper.Instance;

        public ConfigurationItemManager(IRepository<TItem, Guid> repository, IRepository<Module, Guid> moduleRepository, IUnitOfWorkManager unitOfWorkManager)
        {
            Repository = repository;
            ModuleRepository = moduleRepository;
            UnitOfWorkManager = unitOfWorkManager;
        }

        private Dictionary<ConfigurationItemVersionStatus, List<ConfigurationItemVersionStatus>> AllowedTransition
        {
            get
            {
                return new Dictionary<ConfigurationItemVersionStatus, List<ConfigurationItemVersionStatus>>() {
                    { ConfigurationItemVersionStatus.Ready, new() { ConfigurationItemVersionStatus.Draft } },
                    { ConfigurationItemVersionStatus.Live, new() { ConfigurationItemVersionStatus.Draft, ConfigurationItemVersionStatus.Ready } },
                    // TODO: review other transition rules
                };
            }
        }

        public virtual async Task UpdateStatusAsync(TItem item, ConfigurationItemVersionStatus status)
        {
            if (item.VersionStatus == status)
                return;

            if (AllowedTransition.TryGetValue(status, out var transition))
            {
                if (!transition.Contains(item.VersionStatus))
                    throw new AbpValidationException("Failed to update status", new List<ValidationResult> { new ValidationResult($"Item status cannot be updated from '{item.VersionStatus}' to '{status}'") });
            }

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
        public virtual async Task CancelVersionAsync(TItem item)
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

            item.NotNull();

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

        public async Task UpdateStatusAsync(ConfigurationItemBase item, ConfigurationItemVersionStatus status)
        {
            await UpdateStatusAsync((TItem)item, status);
        }

        public async Task<ConfigurationItemBase> CopyAsync(ConfigurationItemBase item, CopyItemInput input)
        {
            return await CopyAsync((TItem)item, input) as ConfigurationItemBase;
        }

        public async Task CancelVersoinAsync(ConfigurationItemBase item)
        {
            await CancelVersionAsync((TItem)item);
        }

        public async Task MoveToModuleAsync(ConfigurationItemBase item, MoveItemToModuleInput input)
        {
            await MoveToModuleAsync((TItem)item, input);
        }

        public async Task<ConfigurationItemBase> CreateNewVersionAsync(ConfigurationItemBase item)
        {
            return await CreateNewVersionAsync((TItem)item) as ConfigurationItemBase;
        }

        public async Task DeleteAllVersionsAsync(ConfigurationItemBase item)
        {
            await DeleteAllVersionsAsync((TItem)item);
        }

        public async Task<IConfigurationItemDto> MapToDtoAsync(ConfigurationItemBase item)
        {
            return await MapToDtoAsync((TItem)item) as IConfigurationItemDto;
        }
    }
}
