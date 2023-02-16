using Abp.Application.Services;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using AutoMapper;
using DocumentFormat.OpenXml.Office2010.Excel;
using Microsoft.AspNetCore.Mvc;
using NHibernate.Linq;
using NUglify.JavaScript.Syntax;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities.Dtos;
using Shesha.Elmah;
using Shesha.Permissions;
using Shesha.Swagger;
using Shesha.Utilities;
using Swashbuckle.AspNetCore.Swagger;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Model Configurations application service
    /// </summary>
    [Route("api/ModelConfigurations")]
    public class ModelConfigurationsAppService : SheshaAppServiceBase, IApplicationService
    {
        private readonly IRepository<EntityConfig, Guid> _entityConfigRepository;
        private readonly IRepository<ConfigurationItem, Guid> _configurationItemRepository;
        private readonly IRepository<Module, Guid> _moduleRepository;
        private readonly IRepository<EntityProperty, Guid> _entityPropertyRepository;
        private readonly IModelConfigurationManager _modelConfigurationManager;
        private readonly IPermissionedObjectManager _permissionedObjectManager;
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly ISwaggerProvider _swaggerProvider;
        private readonly IEntityConfigurationStore _entityConfigurationStore;


        public ModelConfigurationsAppService(
            IRepository<EntityConfig, Guid> entityConfigRepository,
            IRepository<ConfigurationItem, Guid> configurationItemRepository,
            IRepository<Module, Guid> moduleRepository,
            IRepository<EntityProperty, Guid> entityPropertyRepository,
            IModelConfigurationManager modelConfigurationProvider,
            IPermissionedObjectManager permissionedObjectManager,
            IUnitOfWorkManager unitOfWorkManager,
            ISwaggerProvider swaggerProvider,
            IEntityConfigurationStore entityConfigurationStore)
        {
            _entityConfigRepository = entityConfigRepository;
            _configurationItemRepository = configurationItemRepository;
            _moduleRepository = moduleRepository;
            _entityPropertyRepository = entityPropertyRepository;
            _modelConfigurationManager = modelConfigurationProvider;
            _permissionedObjectManager = permissionedObjectManager;
            _unitOfWorkManager = unitOfWorkManager;
            _swaggerProvider = swaggerProvider;
            _entityConfigurationStore = entityConfigurationStore;
        }

        [HttpGet, Route("")]
        public async Task<ModelConfigurationDto> GetByNameAsync(string name, string @namespace)
        {
            var dto = await _modelConfigurationManager.GetModelConfigurationOrNullAsync(@namespace, name);
            if (dto == null)
            {
                var exception = new EntityNotFoundException("Model configuration not found");
                exception.MarkExceptionAsLogged();
                throw exception;
            }

            return dto;
        }

        [HttpGet, Route("{id}")]
        public async Task<ModelConfigurationDto> GetByIdAsync(Guid id)
        {
            var modelConfig = await _entityConfigRepository.GetAll().Where(m => m.Id == id).FirstOrDefaultAsync();
            if (modelConfig == null)
            {
                var exception = new EntityNotFoundException("Model configuration not found");
                exception.MarkExceptionAsLogged();
                throw exception;
            }

            return await _modelConfigurationManager.GetModelConfigurationAsync(modelConfig);
        }

        [HttpPut, Route("")]
        public async Task<ModelConfigurationDto> UpdateAsync(ModelConfigurationDto input)
        {
            var modelConfig = await _entityConfigRepository.GetAll().Where(m => m.Id == input.Id).FirstOrDefaultAsync();
            if (modelConfig == null)
                new EntityNotFoundException("Model configuration not found");

            if (modelConfig.Source == MetadataSourceType.UserDefined)
            {
                input.Namespace = "Dynamic";
                input.ClassName = input.Name;
            }

            // todo: add validation

            return await CreateOrUpdateAsync(modelConfig, input, false);
        }

        [HttpPost, Route("merge")]
        public async Task<ModelConfigurationDto> MergeAsync(MergeConfigurationDto input)
        {
            var source = await AsyncQueryableExecuter.FirstOrDefaultAsync(_entityConfigRepository.GetAll().Where(x => x.Id == input.SourceId.ToGuid()));
            if (source == null)
                new EntityNotFoundException("Source configuration not found");
            var destination = await AsyncQueryableExecuter.FirstOrDefaultAsync(_entityConfigRepository.GetAll().Where(x => x.Id == input.DestinationId.ToGuid()));
            if (source == null)
                new EntityNotFoundException("Destination configuration not found");

            using (var uow = UnitOfWorkManager.Begin())
            {
                await _modelConfigurationManager.MergeConfigurationsAsync(source, destination, input.DeleteAfterMerge,
                    // use deep update if merge from not implemented to implemented application entity
                    source.Source == MetadataSourceType.ApplicationCode
                    && destination.Source == MetadataSourceType.ApplicationCode
                    && _entityConfigurationStore.GetOrNull(source.FullClassName) == null
                    && _entityConfigurationStore.GetOrNull(destination.FullClassName) != null);

                await uow.CompleteAsync();
            }

            // Notify change
            // ASP.Net Core register Controller at runtime
            // https://stackoverflow.com/questions/46156649/asp-net-core-register-controller-at-runtime
            if (SheshaActionDescriptorChangeProvider.Instance != null)
            {
                SheshaActionDescriptorChangeProvider.Instance.HasChanged = true;
                SheshaActionDescriptorChangeProvider.Instance.TokenSource?.Cancel();
                (_swaggerProvider as CachingSwaggerProvider)?.ClearCache();
            }

            return await _modelConfigurationManager.GetModelConfigurationAsync(destination);
        }

        [HttpPost, Route("")]
        public async Task<ModelConfigurationDto> CreateAsync(ModelConfigurationDto input)
        {
            var modelConfig = new EntityConfig();

            input.Namespace = "Dynamic";
            input.ClassName = input.Name;

            // todo: add validation

            return await CreateOrUpdateAsync(modelConfig, input, true);
        }

        private async Task<ModelConfigurationDto> CreateOrUpdateAsync(EntityConfig modelConfig, ModelConfigurationDto input, bool create)
        {
            var mapper = GetModelConfigMapper(modelConfig.Source ?? Domain.Enums.MetadataSourceType.UserDefined);
            mapper.Map(input, modelConfig);

            var module = input.ModuleId.HasValue
                ? await _moduleRepository.GetAsync(input.ModuleId.Value)
                : null;

            modelConfig.Configuration.Module = module;
            modelConfig.Configuration.Name = input.Name;
            modelConfig.Configuration.Label = input.Label;
            modelConfig.Configuration.Description = input.Description;
            modelConfig.Configuration.Suppress = input.Suppress;

            // ToDo: Temporary
            modelConfig.Configuration.VersionNo = 1;
            modelConfig.Configuration.VersionStatus = ConfigurationItemVersionStatus.Live;

            modelConfig.Normalize();

            if (create)
            {
                await _configurationItemRepository.InsertAsync(modelConfig.Configuration);
                await _entityConfigRepository.InsertAsync(modelConfig);
            }
            else
            {
                await _configurationItemRepository.UpdateAsync(modelConfig.Configuration);
                await _entityConfigRepository.UpdateAsync(modelConfig);
            }

            var properties = await _entityPropertyRepository.GetAll().Where(p => p.EntityConfig == modelConfig).OrderBy(p => p.SortOrder).ToListAsync();

            var mappers = new Dictionary<MetadataSourceType, IMapper> {
                { MetadataSourceType.ApplicationCode, GetPropertyMapper(MetadataSourceType.ApplicationCode) },
                { MetadataSourceType.UserDefined, GetPropertyMapper(MetadataSourceType.UserDefined) }
            };

            await BindProperties(mappers, properties, input.Properties, modelConfig, null);

            // delete missing properties
            var allPropertiesId = new List<Guid>();
            ActionPropertiesRecursive(input.Properties, prop =>
            {
                var id = prop.Id.ToGuidOrNull();
                if (id != null)
                    allPropertiesId.Add(id.Value);
            });
            var toDelete = properties.Where(p => !allPropertiesId.Contains(p.Id)).ToList();
            foreach (var prop in toDelete)
            {
                await _entityPropertyRepository.DeleteAsync(prop);
            }

            if (input.Permission != null)
            {
                await _permissionedObjectManager.SetPermissionsAsync(
                    $"{modelConfig.Namespace}.{modelConfig.ClassName}",
                    input.Permission.Access ?? RefListPermissionedAccess.Inherited,
                    input.Permission.Permissions.ToList());
            }
            if (input.PermissionGet != null)
            {
                await _permissionedObjectManager.SetPermissionsAsync(
                $"{modelConfig.Namespace}.{modelConfig.ClassName}@Get",
                input.PermissionGet.Access ?? RefListPermissionedAccess.Inherited,
                input.PermissionGet.Permissions.ToList());
            }
            if (input.PermissionCreate != null)
            {
                await _permissionedObjectManager.SetPermissionsAsync(
                    $"{modelConfig.Namespace}.{modelConfig.ClassName}@Create",
                    input.PermissionCreate.Access ?? RefListPermissionedAccess.Inherited,
                    input.PermissionCreate.Permissions.ToList());
            }
            if (input.PermissionUpdate != null)
            {
                await _permissionedObjectManager.SetPermissionsAsync(
                $"{modelConfig.Namespace}.{modelConfig.ClassName}@Update",
                input.PermissionUpdate.Access ?? RefListPermissionedAccess.Inherited,
                input.PermissionUpdate.Permissions.ToList());
            }
            if (input.PermissionDelete != null)
            {
                await _permissionedObjectManager.SetPermissionsAsync(
                $"{modelConfig.Namespace}.{modelConfig.ClassName}@Delete",
                input.PermissionDelete.Access ?? RefListPermissionedAccess.Inherited,
                input.PermissionDelete.Permissions.ToList());
            }

            // Notify change
            // ASP.Net Core register Controller at runtime
            // https://stackoverflow.com/questions/46156649/asp-net-core-register-controller-at-runtime
            if (SheshaActionDescriptorChangeProvider.Instance != null)
            {
                SheshaActionDescriptorChangeProvider.Instance.HasChanged = true;
                SheshaActionDescriptorChangeProvider.Instance.TokenSource?.Cancel();
                (_swaggerProvider as CachingSwaggerProvider)?.ClearCache();
            }

            return await _modelConfigurationManager.GetModelConfigurationAsync(modelConfig);
        }

        private void ActionPropertiesRecursive(List<ModelPropertyDto> properties, Action<ModelPropertyDto> action)
        {
            if (properties == null) return;
            foreach (var property in properties)
            {
                action.Invoke(property);
                if (property.Properties != null)
                    ActionPropertiesRecursive(property.Properties, action);
            }
        }

        private async Task BindProperties(Dictionary<MetadataSourceType, IMapper> mappers, List<EntityProperty> allProperties, List<ModelPropertyDto> inputProperties, EntityConfig modelConfig, EntityProperty parentProperty)
        {
            if (inputProperties == null) return;
            var sortOrder = 0;
            foreach (var inputProp in inputProperties)
            {
                var propId = inputProp.Id.ToGuid();
                var dbProp = propId != Guid.Empty
                    ? allProperties.FirstOrDefault(p => p.Id == propId)
                    : null;
                var isNew = dbProp == null;
                if (dbProp == null)
                    dbProp = new EntityProperty
                    {
                        EntityConfig = modelConfig,
                    };
                dbProp.ParentProperty = parentProperty;

                var propertyMapper = mappers[dbProp.Source ?? MetadataSourceType.UserDefined];
                propertyMapper.Map(inputProp, dbProp);

                // bind child properties
                if (inputProp.Properties != null && inputProp.Properties.Any())
                    await BindProperties(mappers, allProperties, inputProp.Properties, modelConfig, dbProp);

                dbProp.SortOrder = sortOrder++;

                await _entityPropertyRepository.InsertOrUpdateAsync(dbProp);
            }
        }

        private IMapper GetModelConfigMapper(MetadataSourceType sourceType)
        {
            var modelConfigMapperConfig = new MapperConfiguration(cfg =>
            {
                var mapExpression = cfg.CreateMap<ModelConfigurationDto, EntityConfig>()
                    .ForMember(d => d.Id, o => o.Ignore());

                if (sourceType == MetadataSourceType.ApplicationCode)
                {
                    mapExpression.ForMember(d => d.ClassName, o => o.Ignore());
                    mapExpression.ForMember(d => d.Namespace, o => o.Ignore());
                }
            });

            return modelConfigMapperConfig.CreateMapper();
        }

        private IMapper GetPropertyMapper(MetadataSourceType sourceType)
        {
            var propertyMapperConfig = new MapperConfiguration(cfg =>
            {
                var mapExpression = cfg.CreateMap<ModelPropertyDto, EntityProperty>()
                    .ForMember(d => d.Id, o => o.Ignore())
                    .ForMember(d => d.EntityConfig, o => o.Ignore())
                    .ForMember(d => d.SortOrder, o => o.Ignore())
                    .ForMember(d => d.Properties, o => o.Ignore())
                    .ForMember(d => d.Source, o => o.Ignore());

                if (sourceType == MetadataSourceType.ApplicationCode)
                {
                    mapExpression.ForMember(d => d.Name, o => o.Ignore());
                    mapExpression.ForMember(d => d.DataType, o => o.Ignore());
                    mapExpression.ForMember(d => d.EntityType, o => o.Ignore());
                }
            });

            return propertyMapperConfig.CreateMapper();
        }

        private async Task<ModelConfigurationDto> GetAsync(EntityConfig modelConfig)
        {
            var dto = ObjectMapper.Map<ModelConfigurationDto>(modelConfig);

            var properties = await _entityPropertyRepository.GetAll().Where(p => p.EntityConfig == modelConfig && p.ParentProperty == null)
                .OrderBy(p => p.SortOrder)
                .ToListAsync();

            dto.Properties = properties.Select(p => ObjectMapper.Map<ModelPropertyDto>(p)).ToList();

            return dto;
        }
    }
}
