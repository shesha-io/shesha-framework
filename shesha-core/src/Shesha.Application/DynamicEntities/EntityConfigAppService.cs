using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Collections.Extensions;
using Abp.Domain.Repositories;
using Abp.Extensions;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
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
    private readonly IEntityTypeConfigurationStore _entityConfigurationStore;
    private readonly IModelConfigurationManager _modelConfigManager;
    private readonly IRepository<ConfigurationItem, Guid> _configItemRepository;
    private readonly IRepository<ConfigurationItemInheritance, string> _configItemInheritanceRepository;
    private readonly IRepository<EntityProperty, Guid> _propertyRepository;
    private readonly IModuleManager _moduleManager;

    public EntityConfigAppService(
        IRepository<EntityConfig, Guid> repository,
        IEntityTypeConfigurationStore entityConfigurationStore,
        IModelConfigurationManager modelConfigManager,
        IRepository<ConfigurationItem, Guid> configItemRepository,
        IRepository<ConfigurationItemInheritance, string> configItemInheritanceRepository,
        IRepository<EntityProperty, Guid> propertyRepository,
        IModuleManager moduleManager
        ) : base(repository)
    {
        _entityConfigurationStore = entityConfigurationStore;
        _modelConfigManager = modelConfigManager;
        _configItemRepository = configItemRepository;
        _configItemInheritanceRepository = configItemInheritanceRepository;
        _propertyRepository = propertyRepository;
        _moduleManager = moduleManager;
    }

    [AllowAnonymous]
    public async Task<FormIdentifier?> GetEntityConfigFormAsync(EntityTypeIdInput entityTypeId, string typeName)
    {
        var entityConfig = await _modelConfigManager.GetByEntityTypeIdAsync(new EntityTypeIdentifier(entityTypeId.Module, entityTypeId.Name ?? "", entityTypeId.EntityType));

        if (entityConfig == null)
            return null;

        var model = (await _modelConfigManager.GetCachedModelConfigurationOrNullAsync(entityConfig, true)).NotNull();

        typeName = typeName.Replace(" ", "").ToLower();

        var configFormId = model.ViewConfigurations.FirstOrDefault(x => x.Type == typeName || x.Type.Replace(" ", "").ToLower() == typeName)?.FormId;

        return configFormId ?? new FormIdentifier(entityConfig.Module?.Name, $"{entityTypeId.Name}-{typeName}");
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

        var entities = await _modelConfigManager.GetMainDataListAsync(query);

        return new PagedResultDto<EntityConfigDto>(totalCount, entities);
    }

    [HttpGet]
    public async Task<List<AutocompleteItemDto>> EntityConfigAutocompleteAsync(bool? implemented, string? term, string? selectedValue)
    {
        var isPreselection = string.IsNullOrWhiteSpace(term) && !string.IsNullOrWhiteSpace(selectedValue);
        var models = await _modelConfigManager.GetMainDataListAsync(implemented: implemented);

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
        var entities = await _modelConfigManager.GetMainDataListAsync();
        var result = new List<EntityConfigurationDto>();

        foreach (var entity in entities)
        {
            // Check if the entity is definitely exists as class
            var entityConfig = _entityConfigurationStore.GetOrNull(entity.FullClassName);
            if (entityConfig == null)
                continue;

            // Skip JsonEntities because the can't use api
            if (entityConfig.EntityType.IsJsonEntityType())
                continue;

            var module = entity.Module.IsNullOrEmpty() ? null : await _moduleManager.GetModuleOrNullAsync(entity.Module.NotNull());
            if (module == null)
                continue;

            var dto = new EntityConfigurationDto
            {
                FullClassName = entity.FullClassName,
                Name = entity.Name,
                Description = entity.Description,
                Accessor = entityConfig.EntityType.GetTypeAccessor(),
                Module = new EntityApiItemBase
                {
                    Name = module.Name,
                    Description = module.Description,
                    Accessor = module.Accessor ?? module.Name,
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
        var groupped = models.GroupBy(e => e.Module, (module, entities) =>
        {
            return new
            {
                Module = module,
                Entities = entities,
            };
        }).ToList();
        
        var lookups = new List<LookupSyncResponse>();

        var lookupData = (await _configItemInheritanceRepository.GetAll()
            .Where(x => x.ItemType == "entity" && x.ModuleId != x.ExposedInModuleId)
            .Select(x => new { x.ItemId, x.Name, x.ModuleName, x.ExposedInModuleName, x.ModuleLevel })
            .ToListAsync())
            .Select(x => new
            {
                x.ItemId,
                x.Name,
                x.ModuleName,
                x.ExposedInModuleName,
                x.ModuleLevel,
                models.FirstOrDefault(m => m.Id == x.ItemId.ToString())?.FullClassName,
            })
            .ToList();

        foreach (var model in models)
        {
            var aliases = (new [] { model.Alias ?? "", model.Accessor ?? "" }).Where(x => x != "" && x != model.Name).ToArray();
            var modelLookup = lookupData.Where(x => x.FullClassName == model.FullClassName).ToList();
            if (modelLookup.Any())
            {
                var items = modelLookup
                    .Select(x => new LookupItemSyncResponse
                    {
                        Module = x.ExposedInModuleName == modelLookup.OrderBy(x => x.ModuleLevel).First().ExposedInModuleName
                            ? "_default"
                            : x.ExposedInModuleName,
                        Match = x.ExposedInModuleName,
                    }).ToList();
                lookups.Add(new LookupSyncResponse()
                {
                    Id = model.FullClassName,
                    Aliases = aliases,
                    Module = model.Module,
                    Name = model.Name,
                    Items = items,
                });
            }
            else
            {
                lookups.Add(new LookupSyncResponse()
                {
                    Id = model.FullClassName,
                    Aliases = aliases,
                    Module = model.Module,
                    Name = model.Name,
                    Items = new List<LookupItemSyncResponse>(),
                });
            }
        }

        var response = new SyncAllResponse()
        {
            Lookups = lookups,
        };

        foreach (var module in input.Modules)
        {
            var backendModule = groupped.FirstOrDefault(g => g.Module == module.Accessor);

            var responseModule = new ModuleSyncResponse() { Accessor = module.Accessor };
            response.Modules.Add(responseModule);

            if (backendModule != null)
            {
                foreach (var requestEntity in module.Entities)
                {
                    var backendEntity = backendModule.Entities.FirstOrDefault(e => e.Name == requestEntity.Accessor && e.Module == module.Accessor);
                    if (backendEntity != null)
                    {
                        if (backendEntity.Md5 == requestEntity.Md5 && backendEntity.ModificationTime == requestEntity.ModificationTime)
                        {
                            //responseModule.Entities.Add(new BaseEntitySyncResponse
                            //{
                            //    Accessor = entity.Accessor,
                            //    Status = SyncStatus.UpToDate,
                            //});
                        }
                        else
                        {
                            responseModule.Entities.Add(new OutOfDateEntitySyncResponse
                            {
                                Accessor = requestEntity.Accessor,
                                Status = SyncStatus.OutOfDate,
                                Metadata = backendEntity.Metadata,
                            });
                        }
                    }
                    else
                    {
                        responseModule.Entities.Add(new BaseEntitySyncResponse
                        {
                            Accessor = requestEntity.Accessor,
                            Status = SyncStatus.Unknown,
                        });
                    }
                }
                var missingEntities = backendModule.Entities.Where(be => be.Module == module.Accessor && !module.Entities.Any(ce => ce.Accessor == be.Name)).ToList();
                foreach (var entity in missingEntities)
                {
                    responseModule.Entities.Add(new OutOfDateEntitySyncResponse
                    {
                        Accessor = entity.Name,
                        Status = SyncStatus.OutOfDate,
                        Metadata = entity.Metadata,
                    });
                }
            }
            else
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
                    ? moduleInfos.First(m => m.Name == module.Module)
                    : null;

                foreach (var entity in module.Entities)
                {
                    var entityType = await metadataService.GetContainerTypeOrNullAsync(moduleInfo?.Name, entity.FullClassName);
                    if (entityType != null)
                    {
                        responseModule.Entities.Add(new OutOfDateEntitySyncResponse
                        {
                            Accessor = entity.Name,
                            Status = SyncStatus.OutOfDate,
                            Metadata = entity.Metadata
                        });
                    }
                    else
                    {
                        // TODO: decide how to handle missing entities. Synchronization shouldn't break on missing entities.
                    }
                }
            }
        }

        return response;
    }
}