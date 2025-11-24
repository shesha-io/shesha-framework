using Abp.Collections.Extensions;
using Abp.Extensions;
using Abp.Runtime.Validation;
using Microsoft.AspNetCore.Mvc;
using Shesha.AutoMapper.Dto;
using Shesha.Configuration.Runtime;
using Shesha.Configuration.Runtime.Exceptions;
using Shesha.DynamicEntities.Dtos;
using Shesha.Extensions;
using Shesha.Metadata.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.Metadata
{
    /// inheritedDoc
    public class MetadataAppService : SheshaAppServiceBase
    {
        private readonly IEntityTypeConfigurationStore _entityConfigurationStore;
        private readonly IHardcodeMetadataProvider _hardcodeMetadataProvider;
        private readonly IMetadataProvider _metadataProvider;
        private readonly EntityModelProvider _entityModelProvider;

        public MetadataAppService(
            IEntityTypeConfigurationStore entityConfigurationStore,
            IHardcodeMetadataProvider hardcodeMetadataProvider,
            IMetadataProvider metadataProvider,
            EntityModelProvider entityModelProvider
        )
        {
            _entityConfigurationStore = entityConfigurationStore;
            _hardcodeMetadataProvider = hardcodeMetadataProvider;
            _metadataProvider = metadataProvider;
            _entityModelProvider = entityModelProvider;
        }

        private (string? fullClassName, string? moduleName, string? className) ParseInputData(string? value)
        {
            var selectedParts = value?.Split(":") ?? [];
            string? fullClassName = null;
            string? moduleName = null;
            string? className = null;

            if (selectedParts.Length == 1)
            {
                fullClassName = selectedParts[0].Trim();
                var classParts = selectedParts[0].Split(".");
                className = classParts[classParts.Length - 1].Trim();
            }
            if (selectedParts.Length == 2)
            {
                moduleName = selectedParts[0].Trim();
                className = selectedParts[1].Trim();
            }

            return (fullClassName, moduleName, className);
        }

        private async Task<List<EntityModelDto>> GetAllModelsAsync()
        {
            return (await _entityModelProvider.GetModelsAsync())
                .Where(x => !x.FullClassName.StartsWith("Abp.")) // Remove ABP entities from Autocomplete
                .ToList();
        }

        [HttpGet]
        public async Task<List<MetadataAutocompleteDto>> AutocompleteAsync(string? type, string? term, string? selectedValue, string? baseModel)
        {
            var allModels = await GetAllModelsAsync();
            var isPreselection = selectedValue.IsNullOrWhiteSpace();

            var (selectedFullClassName, selectedModule, selectedClass) = ParseInputData(selectedValue);
            var (searchFullClassName, searchModule, searchClass) = ParseInputData(term);

            EntityModelDto? baseEntity = null;
            if (!baseModel.IsNullOrWhiteSpace())
            {
                var (baseFullClassName, baseModule, baseClass) = ParseInputData(term);

                baseEntity = allModels.FirstOrDefault(e => (
                    !string.IsNullOrWhiteSpace(e.Alias) && e.Alias == baseFullClassName
                    || (baseFullClassName != null && e.FullClassName == baseFullClassName)
                    || (baseModule != null && e.Name == baseClass && e.Module == baseModule)
                ));
            }

            var models = allModels
                .Where(m => !m.IsExposed)
                .WhereIf(type == "Entity", x => x.Metadata.EntityConfigType == Domain.Enums.EntityConfigTypes.Class)
                .WhereIf(type == "JsonEntity", x => x.Metadata.EntityConfigType == Domain.Enums.EntityConfigTypes.Interface)
                .WhereIf(baseEntity != null, x => x.Type.IsAssignableTo(baseEntity?.Type))
                .ToList();


            var entities = models
                .Where(e => (
                    !string.IsNullOrWhiteSpace(e.Alias) && e.Alias == selectedFullClassName
                    || (selectedFullClassName != null && e.FullClassName == selectedFullClassName)
                    || (selectedModule != null && e.Name == selectedClass && e.Module == selectedModule)
                ))
                .ToList();

            entities.AddRange(models
                .Where(e => (
                    string.IsNullOrWhiteSpace(term)
                    || e.Name.Contains(term, StringComparison.InvariantCultureIgnoreCase) && !e.FullClassName.Contains("AspNetCore")
                    || searchModule != null && e.Name == searchClass && e.Module == searchModule
                ))
                .OrderBy(e => e.Name).Take(10).ToList());

            var result = entities
                .DistinctBy(e => e.FullClassName)
                .Select(e => new MetadataAutocompleteDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    Module = e.Module,
                    Description = e.Metadata.Description,
                    ClassName = e.FullClassName,
                    Alias = e.Alias
                })
                .ToList();

            return result;
        }

        private List<AutocompleteItemDto> FilterProperties(List<PropertyMetadataDto> properties, string? term, string? selectedValue)
        {
            var isPreselection = string.IsNullOrWhiteSpace(term) && !string.IsNullOrWhiteSpace(selectedValue);
            var entities = isPreselection
                ? properties.Where(e =>
                    (e.Label != null && e.Label.Equals(selectedValue, StringComparison.InvariantCultureIgnoreCase)) ||
                    e.Path.Equals(selectedValue, StringComparison.InvariantCultureIgnoreCase)).ToList()
                : properties
                .Where(e =>
                    string.IsNullOrWhiteSpace(term) ||
                    (!string.IsNullOrWhiteSpace(e.Path) &&
                     e.Path.Contains(term, StringComparison.InvariantCultureIgnoreCase)) ||
                    (!string.IsNullOrWhiteSpace(e.Label) &&
                     e.Label.Contains(term, StringComparison.InvariantCultureIgnoreCase))
                )
                .OrderBy(e => e.Label ?? e.Path)
                .Take(10)
                .ToList();

            var result = entities
                .Select(e => new AutocompleteItemDto
                {
                    DisplayText = !string.IsNullOrWhiteSpace(e.Label) ? e.Label : e.Path,
                    Value = e.Path
                })
                .ToList();

            return result;
        }

        /// inheritedDoc
        [HttpGet]
        public async Task<List<PropertyMetadataDto>> PropertyAutocompleteAsync(string? term, string container, string? selectedValue)
        {
            if (string.IsNullOrWhiteSpace(container))
                throw new AbpValidationException($"'{nameof(container)}' is mandatory");

            var containerType = await _metadataProvider.GetContainerTypeOrNullAsync(null, container);

            if (containerType == null)
                return new List<PropertyMetadataDto>();

            var allProps = containerType.GetProperties(BindingFlags.Public | BindingFlags.Instance);

            var metadataContext = new MetadataContext(containerType);
            var allPropsMetadata = allProps.Select(p => _hardcodeMetadataProvider.GetPropertyMetadata(p, metadataContext)).ToList();

            var result = allPropsMetadata
                .Where(e => string.IsNullOrWhiteSpace(term) || e.Path.Contains(term, StringComparison.InvariantCultureIgnoreCase))
                .OrderBy(e => e.Path).Take(10).ToList();

            return result;
        }

        private (string? module, string name) ParseContainer(string container)
        {
            if (string.IsNullOrWhiteSpace(container))
                throw new AbpValidationException($"'{nameof(container)}' is mandatory");

            var parts = container.Split(':');

            if (parts.Length > 2)
                throw new AbpValidationException($"Incorrect container format '{nameof(container)}'. Should be 'module:name' or 'className'");

            return (parts.Length > 1 ? parts[0] : null, parts.Last());
        }

        /// inheritedDoc
        [HttpGet]
        public async Task<List<PropertyMetadataDto>> GetPropertiesAsync(string container)
        {
            var (module, name) = ParseContainer(container);
            var containerType = await _metadataProvider.GetContainerTypeAsync(module, name);
            var properties = await _metadataProvider.GetPropertiesAsync(containerType);
            return properties;
        }

        /// inheritedDoc
        [HttpGet]
        public async Task<List<AutocompleteItemDto>> GetNonFrameworkRelatedPropertiesAsync(string container, string? term, string? selectedValue)
        {
            var (module, name) = ParseContainer(container);
            var containerType = await _metadataProvider.GetContainerTypeAsync(module, name);
            var properties = await _metadataProvider.GetPropertiesAsync(containerType);
            var nonFrameworkRelatedProperties = properties.Where(x => x.IsFrameworkRelated == false).ToList();
            return FilterProperties(nonFrameworkRelatedProperties, term, selectedValue);
        }

        /// inheritedDoc
        [HttpGet]
        public async Task<MetadataDto> GetAsync(EntityTypeIdInput entityType)
        {
            if (entityType == null)
                throw new AbpValidationException($"'{nameof(entityType)}' is mandatory");

            var containerName = entityType.Name.GetDefaultIfEmpty(entityType.FullClassName);
            if (string.IsNullOrWhiteSpace(containerName))
                throw new AbpValidationException($"Either '{nameof(entityType.Name)}' or '{nameof(entityType.FullClassName)}' must be provided");
            
            var containerType = await _metadataProvider.GetContainerTypeAsync(entityType.Module, containerName);
            return await _metadataProvider.GetAsync(containerType);
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

            return await _metadataProvider.GetSpecificationsAsync(entityConfig.EntityType);
        }

        #region for backward compatibility

        private List<AutocompleteItemDto> FilterModels(List<EntityModelDto> models, string? term, string? selectedValue)
        {
            var isPreselection = string.IsNullOrWhiteSpace(term) && !string.IsNullOrWhiteSpace(selectedValue);
            var entities = isPreselection
                ? models.Where(e => e.FullClassName == selectedValue || e.Alias == selectedValue).ToList()
                : models
                .Where(e => (
                    string.IsNullOrWhiteSpace(term) ||
                    !string.IsNullOrWhiteSpace(e.Alias) && e.Alias.Contains(term, StringComparison.InvariantCultureIgnoreCase) ||
                    e.FullClassName.Contains(term, StringComparison.InvariantCultureIgnoreCase)) && !e.FullClassName.Contains("AspNetCore")
                )
                .OrderBy(e => e.FullClassName)
                .Take(10)
                .ToList();

            var result = entities
                .DistinctBy(e => e.FullClassName)
                .Select(e => new AutocompleteItemDto
                {
                    DisplayText = $"{e.Name} ({e.FullClassName})",
                    Value = !string.IsNullOrWhiteSpace(e.Alias)
                        ? e.Alias
                        : e.FullClassName
                })
                .ToList();

            return result;
        }

        [HttpGet]
        public async Task<List<AutocompleteItemDto>> TypeAutocompleteAsync(string? term, string? selectedValue)
        {
            var models = await GetAllModelsAsync();
            return FilterModels(models, term, selectedValue);
        }

        /// inheritedDoc
        [HttpGet]
        public async Task<List<AutocompleteItemDto>> EntityTypeAutocompleteAsync(string? term, string? selectedValue, string? baseClass)
        {
            var models = await GetAllModelsAsync();
            var baseEntity = baseClass.IsNullOrEmpty() ? null : models.FirstOrDefault(x => x.Type?.FullName == baseClass || x.Alias == baseClass || x.Accessor == baseClass);
            var list = models
                .Where(x => x.Type.IsEntityType())
                .WhereIf(baseEntity != null, x => x.Type != null && x.Type.IsAssignableTo(baseEntity?.Type))
                .ToList();
            return FilterModels(list, term, selectedValue);
        }

        /// inheritedDoc
        [HttpGet]
        public async Task<List<AutocompleteItemDto>> JsonEntityTypeAutocompleteAsync(string? term, string? selectedValue, string? baseClass)
        {
            var models = await GetAllModelsAsync();
            var baseEntity = baseClass.IsNullOrEmpty() ? null : models.FirstOrDefault(x => x.Type?.FullName == baseClass || x.Alias == baseClass || x.Accessor == baseClass);
            var list = models
                .Where(x => x.Type.IsJsonEntityType())
                .WhereIf(baseEntity != null, x => x.Type != null && x.Type.IsAssignableTo(baseEntity?.Type))
                .ToList();
            return FilterModels(list, term, selectedValue);
        }

        #endregion
    }
}
