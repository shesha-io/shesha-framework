using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Events.Bus.Entities;
using Abp.Events.Bus.Handlers;
using Shesha.ConfigurationItems;
using Shesha.ConfigurationItems.Models;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Dto.Interfaces;
using Shesha.Extensions;
using Shesha.Services.Settings.Cache;
using Shesha.Services.Settings.Dto;
using Shesha.Settings;
using Shesha.Utilities;
using Shesha.Validations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;

namespace Shesha.Services.Settings
{
    /// inheritedDoc
    public class SettingStore : ConfigurationItemManager<SettingConfiguration>, ISettingStore, ITransientDependency,
        IAsyncEventHandler<EntityChangedEventData<SettingDefinition>>,
        IAsyncEventHandler<EntityChangingEventData<SettingValue>>
    {
        private readonly IRepository<SettingValue, Guid> _settingValueRepository;
        private readonly IConfigurationFrameworkRuntime _cfRuntime;
        private readonly ISettingCacheHolder _cacheHolder;
        

        /// <summary>
        /// Default constructor
        /// </summary>
        public SettingStore(
            IRepository<SettingConfiguration, Guid> repository, 
            IRepository<ConfigurationItem, Guid> configurationItemRepository, 
            IRepository<Module, Guid> moduleRepository, 
            IUnitOfWorkManager unitOfWorkManager,
            IRepository<SettingValue, Guid> settingValueRepository,
            IConfigurationFrameworkRuntime cfRuntime,
            ISettingCacheHolder cacheHolder) : base(repository, moduleRepository, unitOfWorkManager)
        {
            _settingValueRepository = settingValueRepository;
            _cfRuntime = cfRuntime;
            _cacheHolder = cacheHolder;
        }

        /// inheritedDoc
        public override Task<SettingConfiguration> CopyAsync(SettingConfiguration item, CopyItemInput input)
        {
            throw new System.NotImplementedException();
        }

        /// inheritedDoc
        public async Task<SettingConfiguration> CreateSettingConfigurationAsync(CreateSettingDefinitionDto input)
        {
            var module = input.ModuleId.HasValue
                ? await ModuleRepository.GetAsync(input.ModuleId.Value)
                : null;

            var validationResults = new List<ValidationResult>();

            var alreadyExist = await Repository.GetAll().Where(f => f.Module == module && f.Name == input.Name).AnyAsync();
            if (alreadyExist)
                validationResults.Add(new ValidationResult(
                    module != null
                        ? $"Setting Definition with name `{input.Name}` already exists in module `{module.Name}`"
                        : $"Setting Definition with name `{input.Name}` already exists"
                    )
                );
            validationResults.ThrowValidationExceptionIfAny(L);

            var definition = new SettingConfiguration();
            definition.Name = input.Name;
            definition.Module = module;
            definition.Description = input.Description;
            definition.Label = input.Label;

            definition.VersionNo = 1;
            definition.VersionStatus = ConfigurationItemVersionStatus.Live;
            definition.Origin = definition;

            definition.DataType = input.DataType;
            definition.EditorFormName = input.EditorFormName;
            definition.EditorFormModule = input.EditorFormModule;
            definition.OrderIndex = input.OrderIndex;
            definition.IsClientSpecific = input.IsClientSpecific;
            definition.AccessMode = input.AccessMode;
            definition.Category = input.Category;
            definition.IsUserSpecific = input.IsUserSpecific;
            definition.ClientAccess = input.ClientAccess;
            
            definition.Normalize();

            await Repository.InsertAsync(definition);

            await UnitOfWorkManager.Current.SaveChangesAsync();

            return definition;
        }

        /// inheritedDoc
        public override async Task<SettingConfiguration> CreateNewVersionAsync(SettingConfiguration item)
        {
            var newVersion = new SettingConfiguration();
            newVersion.Origin = item.Origin;
            newVersion.Name = item.Name;
            newVersion.Module = item.Module;
            newVersion.Application = item.Application;
            newVersion.Description = item.Description;
            newVersion.Label = item.Label;
            newVersion.TenantId = item.TenantId;

            newVersion.ParentVersion = item; // set parent version
            newVersion.VersionNo = item.VersionNo + 1; // version + 1
            newVersion.VersionStatus = ConfigurationItemVersionStatus.Draft; // draft

            newVersion.DataType = item.DataType;
            newVersion.EditorFormName = item.EditorFormName;
            newVersion.EditorFormModule = item.EditorFormModule;
            newVersion.OrderIndex = item.OrderIndex;
            newVersion.IsClientSpecific = item.IsClientSpecific;
            newVersion.AccessMode = item.AccessMode;
            newVersion.Category = item.Category;
            newVersion.IsUserSpecific = item.IsUserSpecific;
            newVersion.ClientAccess = item.ClientAccess;
            newVersion.Normalize();

            await Repository.InsertAsync(newVersion);

            return newVersion;
        }

        /// inheritedDoc
        public Task<SettingConfiguration> GetSettingConfigurationAsync(ConfigurationItemIdentifier id)
        {
            return Repository.GetAll()
                .Where(new ByNameAndModuleSpecification<SettingConfiguration>(id.Name, id.Module).ToExpression())
                .Where(s => s.IsLast && s.VersionStatus == ConfigurationItemVersionStatus.Live)
                .FirstOrDefaultAsync();
        }

        /// inheritedDoc
        public override Task<IConfigurationItemDto> MapToDtoAsync(SettingConfiguration item)
        {
            var dto = ObjectMapper.Map<SettingDefinitionDto>(item);
            return Task.FromResult<IConfigurationItemDto>(dto);
        }

        /// inheritedDoc
        public Task<SettingValue> GetSettingValueAsync(SettingDefinition setting, SettingManagementContext context)
        {
            return WithUnitOfWorkAsync(async () => {
                var settingConfiguration = await GetSettingConfigurationAsync(setting);
                var query = _settingValueRepository.GetAll()
                    .Where(v => v.SettingConfiguration.Id == settingConfiguration.Id);

                if (setting.IsClientSpecific)
                {
                    var appKey = context.AppKey ?? _cfRuntime.FrontEndApplication;
                    query = query.Where(new ByApplicationSpecification<SettingValue>(appKey).ToExpression());
                }

                if (setting.IsUserSpecific)
                {
                    query = query.Where(new ByUserSpecification<SettingValue>(context.UserId).ToExpression());
                }

                return await query.FirstOrDefaultAsync();
            });
        }

        private Task<SettingConfiguration> GetSettingConfigurationAsync(SettingDefinition setting) 
        {
            return GetSettingConfigurationAsync(new SettingConfigurationIdentifier(setting.ModuleName, setting.Name));
        }

        private async Task<TResult> WithUnitOfWorkAsync<TResult>(Func<Task<TResult>> action)
        {
            if (UnitOfWorkManager.Current != null)
                return await action.Invoke();

            using (var uow = UnitOfWorkManager.Begin()) 
            {
                var result = await action.Invoke();
                await uow.CompleteAsync();
                
                return result;
            }
        }

        private string GetCacheKey(CacheKeyArgs args)
        {
            var parts = new List<string?> {
                !string.IsNullOrWhiteSpace(args.Module) ? $"{args.Module}/{args.Name}" : args.Name,
                args.IsClientSpecific ? args.AppKey ?? string.Empty : null,
                args.IsUserSpecific ? args.UserId?.ToString() ?? string.Empty : null,
            }.WhereNotNull();

            return parts.Delimited("|");
        }       

        /// inheritedDoc
        public async Task<string?> GetValueAsync(SettingDefinition setting, SettingManagementContext context)
        {
            var cacheKey = GetCacheKey(new CacheKeyArgs(setting, context));

            var result = await _cacheHolder.Cache.GetAsync(cacheKey, async(key) => {
                var value = await GetSettingValueAsync(setting, context);
                return new CachedSettingValue(value?.Value);
            });

            return result.Value;
        }

        /// <summary>
        /// SettingDefinition changing handler
        /// </summary>
        public Task HandleEventAsync(EntityChangedEventData<SettingDefinition> eventData)
        {
            // TODO: clear cache partially on configuration update (maybe using tags which are under development currently)
            return _cacheHolder.Cache.ClearAsync();
        }

        /// <summary>
        /// SettingValue changing handler
        /// </summary>
        public async Task HandleEventAsync(EntityChangingEventData<SettingValue> eventData)
        {
            if (eventData.Entity == null)
                return;

            var cacheKey = GetCacheKey(new CacheKeyArgs(eventData.Entity));
            await _cacheHolder.Cache.RemoveAsync(cacheKey);
        }
        private class CacheKeyArgs
        {
            public string? Module { get; private set; }
            public string Name { get; private set; }
            public bool IsClientSpecific { get; private set; }
            public string? AppKey { get; private set; }
            public bool IsUserSpecific { get; private set; }
            public Int64? UserId { get; private set; }

            public CacheKeyArgs(SettingDefinition setting, SettingManagementContext context)
            {
                Module = setting.ModuleName;
                Name = setting.Name;
                IsClientSpecific = setting.IsClientSpecific;
                IsUserSpecific = setting.IsUserSpecific;
                AppKey = context.AppKey;
                UserId = context.UserId;
            }
            public CacheKeyArgs(SettingValue settingValue)
            {
                var config = settingValue.SettingConfiguration;

                Module = config.Module?.Name;
                Name = config.Name;
                IsClientSpecific = config.IsClientSpecific;
                IsUserSpecific = config.IsUserSpecific;
                AppKey = settingValue.Application?.AppKey;
                UserId = settingValue.User?.Id;
            }
        }
    }
}
