using Abp.Dependency;
using Abp.ObjectMapping;
using Abp.Reflection;
using Abp.Threading;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Shesha.Attributes;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
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
        private readonly IActionDescriptorCollectionProvider? _actionDescriptorCollectionProvider;
        private readonly ISpecificationsFinder _specificationsFinder;
        private readonly IModelConfigurationManager _modelConfigurationProvider;
        private readonly IHardcodeMetadataProvider _hardcodeMetadataProvider;
        private readonly IObjectMapper _mapper;
        private readonly IAssemblyFinder _assemblyFinder;

        public MetadataProvider(
            IEntityConfigurationStore entityConfigurationStore,
            ISpecificationsFinder specificationsFinder,
            IModelConfigurationManager modelConfigurationProvider,
            IHardcodeMetadataProvider hardcodeMetadataProvider,
            IObjectMapper mapper,
            IIocResolver iocResolver,
            IAssemblyFinder assemblyFinder
        )
        {
            _entityConfigurationStore = entityConfigurationStore;
            _specificationsFinder = specificationsFinder;
            _modelConfigurationProvider = modelConfigurationProvider;
            _hardcodeMetadataProvider = hardcodeMetadataProvider;
            _mapper = mapper;
            _assemblyFinder = assemblyFinder;

            _actionDescriptorCollectionProvider = iocResolver.IsRegistered<IActionDescriptorCollectionProvider>()
                ? iocResolver.Resolve<IActionDescriptorCollectionProvider>()
                : null;
        }

        // ToDo: AS - support Dynamic entities
        public async Task<MetadataDto> GetAsync(Type containerType)
        {
            var isEntity = containerType.IsEntityType();
            var isJsonEntity = containerType.IsJsonEntityType();

            var (changeTime, properties) = await GetPropertiesInternalAsync(containerType);

            var dto = new MetadataDto
            {
                DataType = isEntity 
                    ? DataTypes.EntityReference 
                    : DataTypes.Object,
                Properties = properties,
                Specifications = await GetSpecificationsAsync(containerType),
                Methods = await GetMethodsAsync(containerType),
                ApiEndpoints = await GetApiEndpointsAsync(containerType),
                ClassName = containerType.GetRequiredFullName(),
                ChangeTime = changeTime,
            };

            UpdateMd5(dto);

            if (containerType != null && (isEntity || isJsonEntity))
            {
                var moduleInfo = containerType.GetConfigurableModuleInfo();

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

        private async Task<List<MethodMetadataDto>> GetMethodsAsync(Type? containerType)
        {
            if (containerType == null)
                return new List<MethodMetadataDto>();

            var assemblies = _assemblyFinder.GetAllAssemblies();

            var methods = ReflectionHelper.GetExtensionMethods(_assemblyFinder, containerType)
                .Where(m => !m.GetGenericArguments().Any() && !m.HasAttribute<ObsoleteAttribute>() &&
                    MethodSupported(m, (type) =>
                    {
                        var dt = _hardcodeMetadataProvider.GetDataTypeByPropertyType(type, null);
                        if (dt == null)
                            return false;

                        switch (dt.DataType)
                        {
                            case DataTypes.Object:
                                return assemblies.Contains(type.Assembly);
                            case DataTypes.Array:
                                {
                                    var elementType = HardcodeMetadataProvider.GetListElementType(type);
                                    return elementType != null && assemblies.Contains(elementType.Assembly);
                                }
                            default:
                                return true;
                        }
                    }))
                .ToList();

            var methodDtos = new List<MethodMetadataDto>();
            foreach (var m in methods) 
            {
                var dto = new MethodMetadataDto
                {
                    Name = m.Name,
                    Description = m.GetDescription(),
                    Arguments = await GetMethodArgumentsAsync(m),
                    ReturnType = await GetMethodReturnTypeAsync(m),
                    IsAsync = m.IsAsync(),
                };
                methodDtos.Add(dto);
            }

            return methodDtos;
        }

        private bool MethodSupported(MethodInfo method, Func<Type, bool> typeSupported)
        {
            if (method.ReturnType != null && !typeSupported(method.ReturnType))
                return false;

            if (method.GetParameters().Any(p => !typeSupported(p.ParameterType)))
                return false;

            return true;
        }

        private Task<DataTypeInfo?> GetMethodReturnTypeAsync(MethodInfo method)
        {
            var result = _hardcodeMetadataProvider.GetDataTypeByPropertyType(method.ReturnType, null);
            return Task.FromResult(result);
        }

        private Task<List<VariableDef>> GetMethodArgumentsAsync(MethodInfo method)
        {
            var result = new List<VariableDef>();
            
            var parameters = method.GetParameters().Skip(1);
            foreach (var parameter in parameters) 
            {
                if (!string.IsNullOrWhiteSpace(parameter.Name))
                    result.Add(new VariableDef 
                    { 
                         Name = parameter.Name,
                         DataType = _hardcodeMetadataProvider.GetDataTypeByPropertyType(parameter.ParameterType, null).NotNull(),
                    });
            }
            
            return Task.FromResult(result);
        }

        public Task<Dictionary<string, ApiEndpointDto>> GetApiEndpointsAsync(Type? containerType)
        {
            var result = new Dictionary<string, ApiEndpointDto>();
            if (_actionDescriptorCollectionProvider == null || containerType == null || !containerType.IsEntityType())
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
                var entityActionAttribute = actionDescriptor.MethodInfo.GetAttributeOrNull<EntityActionAttribute>(true);
                if (entityActionAttribute != null)
                {
                    var url = actionDescriptor.AttributeRouteInfo?.Template;
                    var httpVerbs = actionDescriptor.ActionConstraints != null 
                        ? actionDescriptor.ActionConstraints.OfType<HttpMethodActionConstraint>()
                            .SelectMany(c => c.HttpMethods)
                            .ToList()
                        : [];

                    if (!string.IsNullOrWhiteSpace(url) && httpVerbs.Count() == 1)
                        result.Add(entityActionAttribute.Action, new ApiEndpointDto
                        {
                            HttpVerb = httpVerbs.First(),
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
        public Task<List<SpecificationDto>> GetSpecificationsAsync(Type? entityType)
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

        public async Task<List<PropertyMetadataDto>> GetPropertiesAsync(Type containerType)
        {
            var (_, properties) = await GetPropertiesInternalAsync(containerType);
            return properties;
        }

        private async Task<(DateTime?, List<PropertyMetadataDto>)> GetPropertiesInternalAsync(Type containerType)
        {
            var metadataContext = new MetadataContext(containerType);

            var hardCodedProps = containerType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                    .Select(p => _hardcodeMetadataProvider.GetPropertyMetadata(p, metadataContext))
                    .OrderBy(e => e.Path)
                    .ToList();

            var result = new List<PropertyMetadataDto>();
            var modelConfig = await _modelConfigurationProvider.GetCachedModelConfigurationOrNullAsync(containerType.Namespace.NotNull(), containerType.Name, hardCodedProps);
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
                        prop.ContainerType = containerType.FullName ?? "";
                        prop.EnumType = hardCodedProp?.EnumType;
                        prop.IsNullable = hardCodedProp?.IsNullable ?? false;
                        prop.OrderIndex = idx;
                        prop.GroupName = hardCodedProp?.GroupName;

                        return prop;
                    })
                    .OrderBy(p => p.OrderIndex)
                    .ToList();
                result = props.Select(p => RemoveSuppressed(p)).WhereNotNull().ToList();
            }
            else
                result = hardCodedProps;

            return (modelConfig?.ChangeTime, result);
        }

        private PropertyMetadataDto? RemoveSuppressed(PropertyMetadataDto prop)
        {
            if (prop.IsVisible)
            {
                prop.Properties = prop.Properties.Select(pp => RemoveSuppressed(pp)).WhereNotNull().ToList();
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