using Abp.Extensions;
using Abp.ObjectMapping;
using Newtonsoft.Json.Linq;
using NHibernate.Hql.Ast.ANTLR.Tree;
using Shesha.Extensions;
using Shesha.FormTemplates.FormComponents;
using Shesha.Metadata;
using Shesha.Metadata.Dtos;
using Shesha.Reflection;
using Stubble.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.DetailsView
{
    public class DetailsViewGenerationLogic: IGenerationLogic
    {
        private readonly IObjectMapper _mapper;
        private readonly IMetadataAppService _metadataAppService;

        public DetailsViewGenerationLogic(IObjectMapper mapper, IMetadataAppService metadataAppService)
        {
            _mapper = mapper;
            _metadataAppService = metadataAppService;
        }
        public async Task<string> PrepareTemplateAsync(string markup, string data, StubbleVisitorRenderer stubbleRenderer, IMetadataAppService metadataAppService)
        {
            var extensionJson = DeserializeExtensionJson(data);
            var parsedMarkup = JObject.Parse(markup);
            
            var entity = await metadataAppService.GetAsync(extensionJson.ModelType);

            List<PropertyMetadataDto> nonFrameworkProperties = entity.Properties.Where(x => !x.IsFrameworkRelated).ToList(); 

            var builder = new DynamicFormBuilder(_mapper, _metadataAppService);

            AddHeader(entity, nonFrameworkProperties, parsedMarkup, extensionJson, builder);

            AddDetailsPanel(nonFrameworkProperties, parsedMarkup, extensionJson, builder);

            if (extensionJson.AddChildTables)
            {
                await AddChildTablesAsync(parsedMarkup, extensionJson, builder);
            }

            var testResult = parsedMarkup;

            return testResult.ToString();
        }

        private List<JToken> FindContainersWithPlaceholder(JObject markup, string placeholder)
        {
            var containers = new List<JToken>();
            FindContainersWithPlaceholderRecursive(markup, placeholder, containers);
            return containers;
        }

        private void FindContainersWithPlaceholderRecursive(JToken token, string className, List<JToken> results)
        {
            if (token is JObject obj)
            {
                // Check if this is a container with our class
                if (obj["componentName"]?.ToString() == className || obj["propertyName"]?.ToString() == className)
                {
                    results.Add(token);
                }

                // Recursively search through all properties
                foreach (var property in obj.Properties())
                {
                    FindContainersWithPlaceholderRecursive(property.Value, className, results);
                }
            }
            else if (token is JArray array)
            {
                foreach (var item in array)
                {
                    FindContainersWithPlaceholderRecursive(item, className, results);
                }
            }
        }

        private DetailsViewExtensionJson DeserializeExtensionJson(string data)
        {
            try
            {
                return System.Text.Json.JsonSerializer.Deserialize<DetailsViewExtensionJson>(data)
                    ?? throw new Exception($"Deserialized extension JSON is null: {data}");
            }
            catch (Exception ex)
            {
                throw new Exception($"Unable to deserialize extension JSON: {data}", ex);
            }
        }

        private void AddHeader(MetadataDto entity, List<PropertyMetadataDto> metadata, JObject markup, DetailsViewExtensionJson extensionJson, DynamicFormBuilder builder)
        {
            var entityDisplayName = entity.GetEntityDisplayName();
            var title = !entityDisplayName.IsNullOrWhiteSpace() ? entityDisplayName : $"{entity.TypeAccessor} Details";

            // Implementation for adding header to the template
            var titleContainer = FindContainersWithPlaceholder(markup, "//*TITLE*//");

            if (titleContainer.Count == 0)
            {
                throw new Exception("No title container found in the markup.");
            } 
                titleContainer[0]["content"] = title;

            if (extensionJson.ShowKeyInformationBar)
            {
                var keyInfoProperties = metadata.Where(x => extensionJson.KeyInformationBarProperties.Contains(x.Path)).ToList();
                var keyInfoBarContainer = FindContainersWithPlaceholder(markup, "//*KEYINFOBAR*//");

                if (keyInfoBarContainer.Count == 0)
                    throw new Exception("No key information bar container found in the markup.");

                builder.AddAdvancedComponent("KeyInformationBar", keyInfoProperties);

                if (keyInfoBarContainer[0]["components"] is JArray array)
                {
                    var lastComponent = builder._components.Last();
                    var componentJson = JObject.FromObject(lastComponent);
                    array.Add(componentJson);
                }

            }
        }

        private void AddDetailsPanel(List<PropertyMetadataDto> metadata, JObject markup, DetailsViewExtensionJson extensionJson, DynamicFormBuilder builder)
        {
            var detailsPanelContainer = FindContainersWithPlaceholder(markup, "//*DETAILSPANEL*//");

            if (detailsPanelContainer.Count == 0)
            {
                throw new Exception("No details panel container found in the markup.");
            }

            if (metadata.Count > 5)
            {
                builder.AddAdvancedComponent("ColumnedInformationBar", metadata);
            } else
            {
                builder.AddComponentsFromMetadata(metadata);
            }

            if (detailsPanelContainer[0]["components"] is JArray array)
            {
                var lastComponent = builder._components.Last();
                var componentJson = JObject.FromObject(lastComponent);
                componentJson["parentId"] = detailsPanelContainer[0]["id"];
                array.Add(componentJson);
            }
        }

        private async Task AddChildTablesAsync(JObject markup, DetailsViewExtensionJson extensionJson, DynamicFormBuilder builder)
        {
            var childTableContainer = FindContainersWithPlaceholder(markup, "//*CHILDTABLES*//");

            if (childTableContainer.Count == 0)
            {
                throw new Exception("No child table container found in the markup.");
            }

           await builder.AddChildTableAsync("tabbedChildTable", extensionJson.ChildTablesList);

            if (childTableContainer[0]["components"] is JArray array)
            {
                var lastComponent = builder._components.Last();
                var componentJson = JObject.FromObject(lastComponent);
                componentJson["parentId"] = childTableContainer[0]["id"];
                array.Add(componentJson);
            }

        }
    }
}
