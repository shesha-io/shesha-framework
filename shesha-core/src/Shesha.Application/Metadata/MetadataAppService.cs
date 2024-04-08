using Abp.Runtime.Validation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using NUglify.JavaScript.Syntax;
using Shesha.Attributes;
using Shesha.AutoMapper.Dto;
using Shesha.Configuration.Runtime;
using Shesha.Configuration.Runtime.Exceptions;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.Metadata.Dtos;
using Shesha.Metadata.Exceptions;
using Shesha.Reflection;
using Shesha.Specifications;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Metadata
{
    /// inheritedDoc
    public class MetadataAppService : SheshaAppServiceBase, IMetadataAppService
    {
        private readonly IEntityConfigurationStore _entityConfigurationStore;
        private readonly IMetadataProvider _metadataProvider;
        private readonly IModelConfigurationManager _modelConfigurationProvider;
        private readonly IEnumerable<IModelProvider> _modelProviders;
        private readonly ISpecificationsFinder _specificationsFinder;

        public MetadataAppService(IEntityConfigurationStore entityConfigurationStore, IMetadataProvider metadataProvider, IModelConfigurationManager modelConfigurationProvider, IEnumerable<IModelProvider> modelProviders, ISpecificationsFinder specificationsFinder)
        {
            _entityConfigurationStore = entityConfigurationStore;
            _metadataProvider = metadataProvider;
            _modelConfigurationProvider = modelConfigurationProvider;
            _modelProviders = modelProviders;
            _specificationsFinder = specificationsFinder;
        }

        private async Task<List<ModelDto>> GetAllModelsAsync()
        {
            var models = new List<ModelDto>();
            foreach (var provider in _modelProviders)
            {
                models.AddRange(await provider.GetModelsAsync());
            }
            return models.Distinct(new ModelDtoTypeComparer()).Where(x => !x.Suppress).ToList();
        }

        [HttpGet]
        public Task<List<AutocompleteItemDto>> TypeAutocompleteAsync(string term, string selectedValue)
        {
            // note: temporary return only entities
            return EntityTypeAutocompleteAsync(term, selectedValue);
        }

        /// inheritedDoc
        [HttpGet]
        public async Task<List<AutocompleteItemDto>> EntityTypeAutocompleteAsync(string term, string selectedValue)
        {
            var isPreselection = string.IsNullOrWhiteSpace(term) && !string.IsNullOrWhiteSpace(selectedValue);
            var models = await GetAllModelsAsync();

            var entities = isPreselection
                ? models.Where(e => e.ClassName == selectedValue || e.Alias == selectedValue).ToList()
                : models
                .Where(e => (string.IsNullOrWhiteSpace(term) ||
                    !string.IsNullOrWhiteSpace(e.Alias) && e.Alias.Contains(term, StringComparison.InvariantCultureIgnoreCase) ||
                    e.ClassName.Contains(term, StringComparison.InvariantCultureIgnoreCase))  && !e.ClassName.Contains("AspNetCore"))
                .OrderBy(e => e.ClassName)
                .Take(10)
                .ToList();

            var result = entities
                .Select(e => new AutocompleteItemDto
                {
                    DisplayText = e.ClassName,
                    Value = !string.IsNullOrWhiteSpace(e.Alias)
                        ? e.Alias
                        : e.ClassName
                })
                .ToList();

            return result;
        }

        private async Task<Type> GetContainerTypeAsync(string container)
        {
            var allModels = await GetAllModelsAsync();
            var models = allModels.Where(m => m.Alias == container || m.ClassName == container).ToList();

            if (models.Count() > 1)
                throw new DuplicateModelsException(models);

            return models.FirstOrDefault()?.Type;
        }

        /// inheritedDoc
        [HttpGet]
        public async Task<List<PropertyMetadataDto>> PropertyAutocompleteAsync(string term, string container, string selectedValue)
        {
            if (string.IsNullOrWhiteSpace(container))
                throw new AbpValidationException($"'{nameof(container)}' is mandatory");

            var containerType = await GetContainerTypeAsync(container);

            if (containerType == null)
                return new List<PropertyMetadataDto>();

            var allProps = containerType.GetProperties(BindingFlags.Public | BindingFlags.Instance);

            var metadataContext = new MetadataContext(containerType);
            var allPropsMetadata = allProps.Select(p => _metadataProvider.GetPropertyMetadata(p, metadataContext)).ToList();

            var result = allPropsMetadata
                .Where(e => string.IsNullOrWhiteSpace(term) || e.Path.Contains(term, StringComparison.InvariantCultureIgnoreCase))
                .OrderBy(e => e.Path)
                .Take(10)
                .ToList();

            return result;
        }

        /// inheritedDoc
        [HttpGet]
        public async Task<List<PropertyMetadataDto>> GetPropertiesAsync(string container)
        {
            if (string.IsNullOrWhiteSpace(container))
                throw new AbpValidationException($"'{nameof(container)}' is mandatory");

            // ToDo: show Dynamic entities
            var containerType = await GetContainerTypeAsync(container);

            var propertiesResponse = await GetPropertiesInternalAsync(containerType, container);
            return propertiesResponse.Properties;
        }

        /// inheritedDoc
        [HttpGet]
        public async Task<MetadataDto> GetAsync(string container)
        {
            if (string.IsNullOrWhiteSpace(container))
                throw new AbpValidationException($"'{nameof(container)}' is mandatory");

            // ToDo: show Dynamic entities
            var containerType = await GetContainerTypeAsync(container);
            if (containerType == null)
                throw new ArgumentException($"Type `{container}` not found");

            var isEntity = containerType.IsEntityType();
            var moduleInfo = containerType.GetConfigurableModuleInfo();

            var propertiesResponse = await GetPropertiesInternalAsync(containerType, container);

            var dto = new MetadataDto
            { 
                DataType = isEntity ? DataTypes.EntityReference : DataTypes.Object,// todo: check other types
                Properties = propertiesResponse.Properties,
                Specifications = await GetSpecificationsAsync(containerType),
                ApiEndpoints = await GetApiEndpoints(containerType),
                ClassName = containerType.FullName,

                MD5 = propertiesResponse.MD5,
                ChangeTime = propertiesResponse.ChangeTime,
            };
            
            if (isEntity) 
            {
                dto.TypeAccessor = containerType.GetTypeAccessor();
                dto.Module = moduleInfo?.Name;
                dto.ModuleAccessor = moduleInfo?.GetModuleAccessor();

                var entityConfig = _entityConfigurationStore.Get(containerType);
                if (entityConfig.HasTypeShortAlias && entityConfig.TypeShortAliasIsValid)
                    dto.Aliases.Add(entityConfig.TypeShortAlias);
            }

            return dto;
        }

        private Task<Dictionary<string, ApiEndpointDto>> GetApiEndpoints(Type containerType)
        {
            var result = new Dictionary<string, ApiEndpointDto>();
            if (containerType == null || !containerType.IsEntityType())
                return Task.FromResult(result);

            var entityConfig = _entityConfigurationStore.Get(containerType);
            if (entityConfig.ApplicationServiceType == null)
                return Task.FromResult(result);

            var provider = IocManager.Resolve<IActionDescriptorCollectionProvider>();
            var actionDescriptors = provider.ActionDescriptors
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
        public async Task<List<SpecificationDto>> SpecificationsAsync(string entityType)
        {
            var entityConfig = _entityConfigurationStore.Get(entityType);
            if (entityConfig == null)
                throw new EntityTypeNotFoundException(entityType);

            return await GetSpecificationsAsync(entityConfig.EntityType);
        }

        private Task<List<SpecificationDto>> GetSpecificationsAsync(Type entityType)
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

        private async Task<GetPropertiesResponse> GetPropertiesInternalAsync(Type containerType, string containerName) 
        {
            var metadataContext = new MetadataContext(containerType);
            var hardCodedProps = containerType == null
                ? new List<PropertyMetadataDto>()
                : containerType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                    .Select(p => _metadataProvider.GetPropertyMetadata(p, metadataContext))
                    .OrderBy(e => e.Path)
                    .ToList();

            var result = new GetPropertiesResponse();
            // try to get data-driven configuration
            var modelConfig = await _modelConfigurationProvider.GetModelConfigurationOrNullAsync(containerType?.Namespace ?? "Dynamic", containerType?.Name ?? containerName, hardCodedProps);
            if (modelConfig != null)
            {
                result.MD5 = modelConfig.MD5;
                result.ChangeTime = modelConfig.ChangeTime;

                var idx = 0;
                var props = modelConfig.Properties
                    .Select(p =>
                    {
                        var hardCodedProp = hardCodedProps.FirstOrDefault(pp => pp.Path == p.Name);

                        idx = p.SortOrder.HasValue ? p.SortOrder.Value : idx + 1;

                        var prop = ObjectMapper.Map<PropertyMetadataDto>(p);
                        prop.EnumType = hardCodedProp?.EnumType;
                        prop.IsNullable = hardCodedProp?.IsNullable ?? false;
                        prop.OrderIndex = idx;
                        prop.GroupName = hardCodedProp?.GroupName;

                        return prop;
                    })
                    .OrderBy(p => p.OrderIndex)
                    .ToList();
                result.Properties = props.Select(p => RemoveSuppressed(p)).Where(p => p != null).ToList();
            }
            else
                result.Properties = hardCodedProps;
            
            return result;
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

        private class ModelDtoTypeComparer : IEqualityComparer<ModelDto>
        {
            bool IEqualityComparer<ModelDto>.Equals(ModelDto x, ModelDto y)
            {
                return x.ClassName == y.ClassName;
            }

            int IEqualityComparer<ModelDto>.GetHashCode(ModelDto obj)
            {
                return obj.GetHashCode();
            }
        }


        private class GetPropertiesResponse 
        { 
            public List<PropertyMetadataDto> Properties { get; set; }
            public string MD5 { get; set; }
            public DateTime ChangeTime { get; set; }
        }        
    }
}
