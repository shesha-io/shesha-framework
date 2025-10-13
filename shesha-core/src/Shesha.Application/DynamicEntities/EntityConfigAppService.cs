using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;
using Shesha.Application.Services.Dto;
using Shesha.AutoMapper.Dto;
using Shesha.Configuration.Runtime;
using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.Metadata;
using Shesha.Reflection;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities;

public class EntityConfigAppService : SheshaCrudServiceBase<EntityConfig, EntityConfigDto, Guid>, IEntityConfigAppService
{
    private readonly IEntityConfigurationStore _entityConfigurationStore;
    private readonly IEntityConfigManager _entityConfigManager;
    private readonly IRepository<ConfigurationItem, Guid> _configItemRepository;
    private readonly IRepository<EntityProperty, Guid> _propertyRepository;    
    private readonly IModuleManager _moduleManager;

    public EntityConfigAppService(
        IRepository<EntityConfig, Guid> repository,
        IEntityConfigurationStore entityConfigurationStore,
        IEntityConfigManager entityConfigManager,
        IRepository<ConfigurationItem, Guid> configItemRepository,
        IRepository<EntityProperty, Guid> propertyRepository,
        IModuleManager moduleManager
        ) : base(repository)
    {
        _entityConfigurationStore = entityConfigurationStore;
        _entityConfigManager = entityConfigManager;
        _configItemRepository = configItemRepository;
        _propertyRepository = propertyRepository;
        _moduleManager = moduleManager;
    }

    public async Task<FormIdentifier?> GetEntityConfigFormAsync(string entityConfigName, string typeName)
    {
        var entityConfig = await Repository.GetAll().Where(x => x.Name == entityConfigName || x.TypeShortAlias == entityConfigName).FirstOrDefaultAsync();
        if (entityConfig == null)
            return null;

        typeName = typeName.Replace(" ", "").ToLower();

        var configFormId = entityConfig.ViewConfigurations.FirstOrDefault(x => x.Type == typeName || x.Type.Replace(" ", "").ToLower() == typeName)?.FormId;

        return configFormId ?? new FormIdentifier(entityConfig.Module?.Name, $"{entityConfigName}-{typeName}");
    }

    // Used to avoid performance issues
    [HttpGet]
    public async Task<PagedResultDto<EntityConfigDto>> GetMainDataListAsync(FilteredPagedAndSortedResultRequestDto input)
    {
        CheckGetAllPermission();

        var query = CreateFilteredQuery(input);

        var totalCount = await AsyncQueryableExecuter.CountAsync(query);

        query = ApplySorting(query, input);
        query = ApplyPaging(query, input);

        var entities = await _entityConfigManager.GetMainDataListAsync(query);

        return new PagedResultDto<EntityConfigDto>(totalCount, entities);
    }

    [HttpGet]
    public async Task<List<AutocompleteItemDto>> EntityConfigAutocompleteAsync(bool? implemented, string? term, string? selectedValue)
    {
        var isPreselection = string.IsNullOrWhiteSpace(term) && !string.IsNullOrWhiteSpace(selectedValue);
        var models = await _entityConfigManager.GetMainDataListAsync(implemented: implemented);

        var entities = isPreselection
            ? models.Where(e => e.Id == selectedValue.NotNull().ToGuid()).ToList()
            : models
            .Where(e => string.IsNullOrWhiteSpace(term)
                || e.FullClassName.Contains(term, StringComparison.InvariantCultureIgnoreCase)
                || e.Label != null && e.Label.Contains(term, StringComparison.InvariantCultureIgnoreCase))
            .OrderBy(e => e.FullClassName)
            .Take(10)
            .ToList();

        var result = entities
            .Select(e => new AutocompleteItemDto
            {
                DisplayText = !string.IsNullOrWhiteSpace(e.Label)
                    ? $"{e.FullClassName} ({e.Label})"
                    : $"{e.FullClassName}",
                Value = e.Id.ToString()
            })
            .ToList();

        return result;
    }

    [HttpDelete]
    public override Task DeleteAsync(EntityDto<Guid> input)
    {
        return DeleteConfigAsync(input.Id);
    }

    private async Task DeleteConfigAsync(Guid id)
    {
        await _propertyRepository.DeleteAsync(x => x.EntityConfig.Id == id);
        await _configItemRepository.DeleteAsync(id);
    }

    [HttpGet]
    public async Task<List<EntityConfigurationDto>> GetClientApiConfigurationsAsync()
    {
        var entities = await _entityConfigManager.GetMainDataListAsync();
        var result = new List<EntityConfigurationDto>();

        foreach (var entity in entities) 
        {
            var entityConfig = _entityConfigurationStore.GetOrNull(entity.FullClassName);
            if (entityConfig == null)
                continue;

            if (entityConfig.EntityType.IsJsonEntityType())
                continue;

            var moduleInfo = entityConfig.EntityType.GetConfigurableModuleInfo();
            if (moduleInfo == null)
                continue;

            var dto = new EntityConfigurationDto
            {
                Name = entity.FullClassName,
                Description = entity.Description,
                Accessor = entityConfig.EntityType.GetTypeAccessor(),
                Module = new EntityApiItemBase {
                    Name = moduleInfo.Name,
                    Description = moduleInfo.Description,
                    Accessor = moduleInfo.GetModuleAccessor(),
                }
            };
            result.Add(dto);
        }        

        return result;
    }

    [HttpPost]
    public async Task<SyncAllResponse> SyncClientApiAsync(SyncAllRequest input)
    {
        var metadataService = IocManager.Resolve<IMetadataProvider>();

        var entityModelProvider = IocManager.Resolve<IEntityModelProvider>();
        var models = await entityModelProvider.GetModelsAsync();
        var groupped = models.GroupBy(e => e.ModuleAccessor, (moduleAccessor, entities) => {
            return new {
                Module = moduleAccessor,
                Entities = entities,
            };
        }).ToList();

        var response = new SyncAllResponse();

        foreach (var module in input.Modules)
        {
            var backendModule = groupped.FirstOrDefault(g => g.Module == module.Accessor);
            
            var responseModule = new ModuleSyncResponse() { Accessor = module.Accessor };
            response.Modules.Add(responseModule);

            if (backendModule != null) 
            {
                foreach (var entity in module.Entities) 
                {
                    var backendEntity = backendModule.Entities.FirstOrDefault(e => e.Accessor == entity.Accessor);
                    if (backendEntity != null)
                    {
                        if (backendEntity.Md5 == entity.Md5 && backendEntity.ModificationTime == entity.ModificationTime)
                        {
                            /*responseModule.Entities.Add(new BaseEntitySyncResponse
                            {
                                Accessor = entity.Accessor,
                                Status = SyncStatus.UpToDate,
                            });*/
                        }
                        else {
                            responseModule.Entities.Add(new OutOfDateEntitySyncResponse
                            {
                                Accessor = entity.Accessor,
                                Status = SyncStatus.OutOfDate,
                                Metadata = backendEntity.Metadata,
                            });
                        }
                    } else {
                        responseModule.Entities.Add(new BaseEntitySyncResponse { 
                            Accessor = entity.Accessor,
                            Status = SyncStatus.Unknown,
                        });
                    }
                }
                var missingEntities = backendModule.Entities.Where(be => !module.Entities.Any(ce => ce.Accessor == be.Accessor)).ToList();
                foreach (var entity in missingEntities) {
                    responseModule.Entities.Add(new OutOfDateEntitySyncResponse
                    {
                        Accessor = entity.Accessor,
                        Status = SyncStatus.OutOfDate,
                        Metadata = entity.Metadata,
                    });
                }
            } else
                responseModule.Status = SyncStatus.Unknown;
        }

        // add new modules (which are missing on client)
        var modulesToAdd = groupped.Where(g => !response.Modules.Any(m => m.Accessor == g.Module)).ToList();
        if (modulesToAdd.Any()) 
        {
            var moduleInfos = _moduleManager.GetModuleInfos();

            foreach (var module in modulesToAdd)
            {
                var responseModule = new ModuleSyncResponse() { Accessor = module.Module, Status = SyncStatus.OutOfDate };
                response.Modules.Add(responseModule);

                var moduleInfo = !string.IsNullOrWhiteSpace(module.Module)
                    ? moduleInfos.First(m => m.GetModuleAccessor() == module.Module)
                    : null;

                foreach (var entity in module.Entities)
                {
                    var entityType = await metadataService.GetContainerTypeOrNullAsync(moduleInfo?.Name, entity.ClassName);
                    if (entityType != null) 
                    {
                        responseModule.Entities.Add(new OutOfDateEntitySyncResponse
                        {
                            Accessor = entity.Accessor,
                            Status = SyncStatus.OutOfDate,
                            Metadata = await metadataService.GetAsync(entityType),
                        });
                    } else 
                    { 
                        // TODO: decide how to handle missing entities. Synchronization shouldn't break on missing entities.
                    }
                }
            }
        }

        return response;
    }
}