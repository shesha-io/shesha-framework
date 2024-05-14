using Abp.Dependency;
using Abp.ObjectMapping;
using Abp.Runtime.Validation;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Shesha.Attributes;
using Shesha.Configuration.Runtime;
using Shesha.DynamicEntities;
using Shesha.Extensions;
using Shesha.Metadata.Dtos;
using Shesha.Reflection;
using Shesha.Specifications;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using System.Threading.Tasks;

namespace Shesha.Metadata
{
    /// <summary>
    /// Metadata provider
    /// </summary>
    public class MetadataProvider: IMetadataProvider, ITransientDependency
    {
        private readonly IEntityConfigurationStore _entityConfigurationStore;
        private readonly IActionDescriptorCollectionProvider _actionDescriptorCollectionProvider;
        private readonly ISpecificationsFinder _specificationsFinder;
        private readonly IModelConfigurationManager _modelConfigurationProvider;
        private readonly IHardcodeMetadataProvider _hardcodeMetadataProvider;
        private readonly IObjectMapper _mapper;

        public MetadataProvider(
            IEntityConfigurationStore entityConfigurationStore,
            IActionDescriptorCollectionProvider actionDescriptorCollectionProvider,
            ISpecificationsFinder specificationsFinder,
            IModelConfigurationManager modelConfigurationProvider,
            IHardcodeMetadataProvider hardcodeMetadataProvider,
            IObjectMapper mapper
        )
        {
            _entityConfigurationStore = entityConfigurationStore;
            _actionDescriptorCollectionProvider = actionDescriptorCollectionProvider;
            _specificationsFinder = specificationsFinder;
            _modelConfigurationProvider = modelConfigurationProvider;
            _hardcodeMetadataProvider = hardcodeMetadataProvider;
            _mapper = mapper;
        }

        // ToDo: support Dynamic entities
        public async Task<MetadataDto> GetAsync(Type containerType, string containerName)
        {
            var isEntity = containerType.IsEntityType();
            var isJsonEntity = containerType.IsJsonEntityType();

            var moduleInfo = containerType.GetConfigurableModuleInfo();

            var (changeTime, properties) = await GetPropertiesInternalAsync(containerType, containerName);

            var dto = new MetadataDto
            {
                DataType = isEntity ? DataTypes.EntityReference : DataTypes.Object,// todo: check other types
                Properties = properties,
                Specifications = await GetSpecificationsAsync(containerType),
                ApiEndpoints = await GetApiEndpoints(containerType),
                ClassName = containerType.FullName,

                ChangeTime = changeTime,
            };

            UpdateMd5(dto);

            if (isEntity || isJsonEntity)
            {
                dto.TypeAccessor = containerType.GetTypeAccessor();
                dto.Module = moduleInfo?.Name;
                dto.ModuleAccessor = moduleInfo?.GetModuleAccessor();

                if (isEntity) 
                {
                    var entityConfig = _entityConfigurationStore.Get(containerType);
                    if (entityConfig.HasTypeShortAlias && entityConfig.TypeShortAliasIsValid)
                        dto.Aliases.Add(entityConfig.TypeShortAlias);
                }
            }

            return dto;
        }

        public Task<Dictionary<string, ApiEndpointDto>> GetApiEndpoints(Type containerType)
        {
            var result = new Dictionary<string, ApiEndpointDto>();
            if (containerType == null || !containerType.IsEntityType())
                return Task.FromResult(result);

            var entityConfig = _entityConfigurationStore.Get(containerType);
            if (entityConfig.ApplicationServiceType == null)
                return Task.FromResult(result);

            var actionDescriptors = _actionDescriptorCollectionProvider.ActionDescriptors
                    .Items
                    .Where(x => x is ControllerActionDescriptor actionDescriptor && actionDescriptor.ControllerTypeInfo.AsType() == entityConfig.ApplicationServiceType)
                    .Cast<ControllerActionDescriptor>()
                    .ToList();
            foreach (var actionDescriptor in actionDescriptors)
            {
                var entityActionAttribute = actionDescriptor.MethodInfo.GetAttribute<EntityActionAttribute>(true);
                if (entityActionAttribute != null)
                {
                    var url = actionDescriptor.AttributeRouteInfo?.Template;
                    var httpVerbs = actionDescriptor.ActionConstraints.OfType<HttpMethodActionConstraint>()
                        .SelectMany(c => c.HttpMethods)
                        .ToList();

                    if (!string.IsNullOrWhiteSpace(url) && httpVerbs.Count() == 1)
                        result.Add(entityActionAttribute.Action, new ApiEndpointDto
                        {
                            HttpVerb = httpVerbs.FirstOrDefault(),
                            Url = url,
                        });
                }
            }

            return Task.FromResult(result);
        }

        /// <summary>
        /// Get specifications available for the specified entityType
        /// </summary>
        /// <returns></returns>
        public Task<List<SpecificationDto>> GetSpecificationsAsync(Type entityType)
        {
            if (entityType == null || !entityType.IsEntityType())
                return Task.FromResult(new List<SpecificationDto>());

            var specifications = _specificationsFinder.AllSpecifications
                .Where(s => entityType.IsAssignableFrom(s.EntityType) /* include base classes */ && !s.IsGlobal)
                .OrderBy(s => s.FriendlyName)
                .ToList();

            var dtos = specifications.Select(s => new SpecificationDto
            {
                Name = s.Name,
                FriendlyName = s.FriendlyName,
                Description = s.Description,
            })
                .ToList();

            return Task.FromResult(dtos);
        }

        public async Task<List<PropertyMetadataDto>> GetPropertiesAsync(Type containerType, string containerName)
        {
            var (date, properties) = await GetPropertiesInternalAsync(containerType, containerName);
            return properties;
        }

        private async Task<(DateTime?, List<PropertyMetadataDto>)> GetPropertiesInternalAsync(Type containerType, string containerName)
        {
            var metadataContext = new MetadataContext(containerType);
            var hardCodedProps = containerType == null
                ? new List<PropertyMetadataDto>()
                : containerType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                    .Select(p => _hardcodeMetadataProvider.GetPropertyMetadata(p, metadataContext))
                    .OrderBy(e => e.Path)
                    .ToList();

            var result = new List<PropertyMetadataDto>();
            var modelConfig = await _modelConfigurationProvider.GetModelConfigurationOrNullAsync(containerType?.Namespace ?? "Dynamic", containerType?.Name ?? containerName, hardCodedProps);
            // try to get data-driven configuration
            if (modelConfig != null)
            {
                var idx = 0;
                var props = modelConfig.Properties
                    .Select(p =>
                    {
                        var hardCodedProp = hardCodedProps.FirstOrDefault(pp => pp.Path == p.Name);

                        idx = p.SortOrder.HasValue ? p.SortOrder.Value : idx + 1;

                        var prop = _mapper.Map<PropertyMetadataDto>(p);
                        prop.EnumType = hardCodedProp?.EnumType;
                        prop.IsNullable = hardCodedProp?.IsNullable ?? false;
                        prop.OrderIndex = idx;
                        prop.GroupName = hardCodedProp?.GroupName;

                        return prop;
                    })
                    .OrderBy(p => p.OrderIndex)
                    .ToList();
                result = props.Select(p => RemoveSuppressed(p)).Where(p => p != null).ToList();
            }
            else
                result = hardCodedProps;

            return (modelConfig?.ChangeTime, result);
        }

        private PropertyMetadataDto RemoveSuppressed(PropertyMetadataDto prop)
        {
            if (prop.IsVisible)
            {
                prop.Properties = prop.Properties.Select(pp => RemoveSuppressed(pp)).Where(p => p != null).ToList();
                return prop;
            }
            return null;
        }

        private void UpdateMd5(MetadataDto dto)
        {
            dto.Md5 = "";
            var json = JsonSerializer.Serialize(dto);
            dto.Md5 = json.ToMd5Fingerprint();
        }
    }
}