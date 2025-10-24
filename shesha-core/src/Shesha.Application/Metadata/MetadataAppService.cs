using Abp.Collections.Extensions;
using Abp.Runtime.Validation;
using Microsoft.AspNetCore.Mvc;
using Shesha.AutoMapper.Dto;
using Shesha.Configuration.Runtime;
using Shesha.Configuration.Runtime.Exceptions;
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
    public class MetadataAppService : SheshaAppServiceBase, IMetadataAppService
    {
        private readonly IEntityConfigurationStore _entityConfigurationStore;
        private readonly IHardcodeMetadataProvider _hardcodeMetadataProvider;
        private readonly IMetadataProvider _metadataProvider;
        private readonly EntityModelProvider _entityModelProvider;

        public MetadataAppService(
            IEntityConfigurationStore entityConfigurationStore,
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

        private List<AutocompleteItemDto> FilterModels(List<ModelDto> models, string? term, string? selectedValue)
        {
            var isPreselection = string.IsNullOrWhiteSpace(term) && !string.IsNullOrWhiteSpace(selectedValue);
            var entities = isPreselection
                ? models.Where(e => e.ClassName == selectedValue || e.Alias == selectedValue).ToList()
                : models
                .Where(e => (
                    string.IsNullOrWhiteSpace(term) ||
                    !string.IsNullOrWhiteSpace(e.Alias) && e.Alias.Contains(term, StringComparison.InvariantCultureIgnoreCase) ||
                    e.ClassName.Contains(term, StringComparison.InvariantCultureIgnoreCase)) && !e.ClassName.Contains("AspNetCore")
                )
                .OrderBy(e => e.ClassName)
                .Take(10)
                .ToList();

            var result = entities
                .Select(e => new AutocompleteItemDto
                {
                    DisplayText = $"{e.Name} ({e.ClassName})",
                    Value = !string.IsNullOrWhiteSpace(e.Alias)
                        ? e.Alias
                        : e.ClassName
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

        [HttpGet]
        public async Task<List<AutocompleteItemDto>> TypeAutocompleteAsync(string? term, string? selectedValue)
        {
            var models = await _metadataProvider.GetAllModelsAsync();
            return FilterModels(models, term, selectedValue);
        }

        /// inheritedDoc
        [HttpGet]
        public async Task<List<AutocompleteItemDto>> EntityTypeAutocompleteAsync(string? term, string? selectedValue, string? baseClass)
        {
            var models = await _entityModelProvider.GetModelsAsync();
            var baseEntity = baseClass.IsNullOrEmpty() ? null : models.FirstOrDefault(x => x.Type?.FullName == baseClass || x.Alias == baseClass || x.Accessor == baseClass);
            var list = models
                .Where(x => x.Type.IsEntityType())
                .WhereIf(baseEntity != null, x => x.Type != null && x.Type.IsAssignableTo(baseEntity?.Type))
                .ToList<ModelDto>();
            return FilterModels(list, term, selectedValue);
        }

        /// inheritedDoc
        [HttpGet]
        public async Task<List<AutocompleteItemDto>> JsonEntityTypeAutocompleteAsync(string? term, string? selectedValue, string? baseClass)
        {
            var models = await _entityModelProvider.GetModelsAsync();
            var baseEntity = baseClass.IsNullOrEmpty() ? null : models.FirstOrDefault(x => x.Type?.FullName == baseClass || x.Alias == baseClass || x.Accessor == baseClass);
            var list = models
                .Where(x => x.Type.IsJsonEntityType())
                .WhereIf(baseEntity != null, x => x.Type != null && x.Type.IsAssignableTo(baseEntity?.Type))
                .ToList<ModelDto>();
            return FilterModels(list, term, selectedValue);
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
            
            var containerType = await _metadataProvider.GetContainerTypeAsync(null, container);
            var properties = await _metadataProvider.GetPropertiesAsync(containerType);
            return properties;
        }

        /// inheritedDoc
        [HttpGet]
        public async Task<List<AutocompleteItemDto>> GetNonFrameworkRelatedPropertiesAsync(string container, string? term, string? selectedValue)
        {
            if (string.IsNullOrWhiteSpace(container))
                throw new AbpValidationException($"'{nameof(container)}' is mandatory");

            var containerType = await _metadataProvider.GetContainerTypeAsync(null, container);
            var properties = await _metadataProvider.GetPropertiesAsync(containerType);
            var nonFrameworkRelatedProperties = properties.Where(x => x.IsFrameworkRelated == false).ToList();
            return FilterProperties(nonFrameworkRelatedProperties, term, selectedValue);
        }

        /// inheritedDoc
        [HttpGet]
        public async Task<MetadataDto> GetAsync(string container)
        {
            if (string.IsNullOrWhiteSpace(container))
                throw new AbpValidationException($"'{nameof(container)}' is mandatory");

            var containerType = await _metadataProvider.GetContainerTypeAsync(null, container);

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
    }
}
