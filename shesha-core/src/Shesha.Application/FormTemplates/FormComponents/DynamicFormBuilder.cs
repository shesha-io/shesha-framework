using Abp.ObjectMapping;
using Newtonsoft.Json;
using Shesha.FormTemplates.FormComponents.Enums;
using Shesha.Metadata;
using Shesha.Metadata.Dtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents
{
    public class DynamicFormBuilder
    {
        public readonly List<dynamic> _components = new List<dynamic>();
        private readonly ComponentFactory _componentFactory;
        private readonly IObjectMapper _mapper;
        private readonly IMetadataAppService _metadataAppService;

        public DynamicFormBuilder(IObjectMapper mapper, IMetadataAppService metadataAppService)
        {
            _mapper = mapper;
            _metadataAppService = metadataAppService;
            _componentFactory = new ComponentFactory(_mapper);
        }
        public DynamicFormBuilder AddComponent(dynamic component)
        {
            _components.Add(component);
            return this;
        }

        public DynamicFormBuilder AddComponent(PropertyMetadataDto metadata, Action<dynamic> configure)
        {
            ConfigurableComponent component = new ConfigurableComponent
            {
                id = Guid.NewGuid().ToString(),
                hidden = metadata.IsVisible,
                label = metadata.Label,
                description = metadata.Description,
                editMode = metadata.Readonly ? "readOnly" : "inherited",
            };
            configure?.Invoke(component);
            _components.Add(component);
            return this;
        }

        /// <summary>
        /// Add component from property metadata
        /// </summary>
        public DynamicFormBuilder AddComponentsFromMetadata(List<PropertyMetadataDto> metadata)
        {
            var component = _componentFactory.CreateComponentsFromMetadata(metadata);
            _components.Add(component);
            return this;
        }

        public DynamicFormBuilder AddAdvancedComponent (string type, List<PropertyMetadataDto> metadata)
        {
            var component = _componentFactory.CreateAdvancedComponent(type, metadata);
            _components.Add(component);
            return this;
        }

        public async Task<DynamicFormBuilder> AddChildTableAsync (string type, List<string> entites)
        {
            var entityMetadata = new List<MetadataDto>();
            foreach (var entity in entites)
            {
                var metadata = await _metadataAppService.GetAsync(entity);
                if (metadata == null)
                    throw new Exception($"Metadata for entity '{entity}' not found");
                entityMetadata.Add(metadata);
            }
            ConfigurableComponent component = _componentFactory.CreateChildTable(type, entityMetadata);
            _components.Add(component);
            return this;
        }

        public string ToJson()
        {
            return JsonConvert.SerializeObject(_components, Formatting.Indented);
        }
    }
}
