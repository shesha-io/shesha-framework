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
        private readonly IEnumerable<IModelProvider> _modelProviders;

        public MetadataAppService(
            IEntityConfigurationStore entityConfigurationStore,
            IHardcodeMetadataProvider hardcodeMetadataProvider,
            IMetadataProvider metadataProvider,
            IEnumerable<IModelProvider> modelProviders
        )
        {
            _entityConfigurationStore = entityConfigurationStore;
            _hardcodeMetadataProvider = hardcodeMetadataProvider;
            _metadataProvider = metadataProvider;
            _modelProviders = modelProviders;
        }

        public async Task<List<ModelDto>> GetAllModelsAsync()
        {
            var models = new List<ModelDto>();
            foreach (var provider in _modelProviders)
            {
                models.AddRange(await provider.GetModelsAsync());
            }
            return models.Distinct(new ModelDtoTypeComparer()).Where(x => !x.Suppress).ToList();
        }

        public async Task<Type> GetContainerTypeAsync(string container)
        {
            var allModels = await GetAllModelsAsync();
            var models = allModels.Where(m => m.Alias == container || m.ClassName == container).ToList();

            if (models.Count() > 1)
                throw new DuplicateModelsException(models);

            return models.FirstOrDefault()?.Type;
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
            
            var containerType = await GetContainerTypeAsync(container);
            var properties = await _metadataProvider.GetPropertiesAsync(containerType, container);
            return properties;
        }

        /// inheritedDoc
        [HttpGet]
        public async Task<MetadataDto> GetAsync(string container)
        {
            return await _metadataProvider.GetAsync(container);
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
    }
}
