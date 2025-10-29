using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Extensions;
using Abp.Runtime.Validation;
using GraphQL;
using Microsoft.AspNetCore.Http;
using Shesha.Application.Services.Dto;
using Shesha.Configuration.Runtime;
using Shesha.DynamicEntities.Cache;
using Shesha.DynamicEntities.Dtos;
using Shesha.Exceptions;
using Shesha.GraphQL.Middleware;
using Shesha.GraphQL.Mvc;
using Shesha.GraphQL.Provider;
using Shesha.Metadata;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Shesha.GraphQL.Helpers
{
    /// <summary>
    /// GraphQL query executer. Implements base queries to entities
    /// </summary>
    public class GraphQLQueryExecuter : IGraphQLQueryExecuter, ITransientDependency
    {
        public IDocumentExecuter DocumentExecuter { get; set; }
        public ISchemaContainer SchemaContainer { get; set; }
        public IGraphQLSerializer Serializer { get; set; }
        public IEntityConfigCache EntityConfigCache { get; set; }
        public IEntityTypeConfigurationStore EntityConfigurationStore { get; set; }

        private readonly IHttpContextAccessor _httpContextAccessor;

        public GraphQLQueryExecuter(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<GraphQLDataResult<TEntity>> QueryAsync<TEntity, TPrimaryKey>(GetDynamicEntityInput<TPrimaryKey> input) where TEntity : IEntity<TPrimaryKey> 
        {
            var result = await GetQueryResultAsync(typeof(TEntity), input);

            return new GraphQLDataResult<TEntity>(result);
        }

        public async Task<GraphQLDataResult> QueryAsync<TPrimaryKey>(Type entityType, GetDynamicEntityInput<TPrimaryKey> input)
        {
            var result = await GetQueryResultAsync(entityType, input);

            return new GraphQLDataResult(result);
        }

        public async Task<ExecutionResult> GetQueryResultAsync<TPrimaryKey>(Type entityType, GetDynamicEntityInput<TPrimaryKey> input) 
        {
            var schemaName = StringHelper.ToCamelCase(entityType.Name);

            var schema = await SchemaContainer.GetOrDefaultAsync(schemaName);
            var httpContext = _httpContextAccessor.HttpContext;

            var properties = string.IsNullOrWhiteSpace(input.Properties)
                    ? await GetGqlTopLevelPropertiesAsync(entityType)
                    : await CleanupPropertiesAsync(entityType, input.Properties);

            var query = $@"query{{
  {schemaName}(id: ""{input.Id}"") {{
    {properties}
  }}
}}";

            var result = await DocumentExecuter.ExecuteAsync(s =>
            {
                s.Schema = schema;

                s.Query = query;

                if (httpContext != null)
                {
                    s.RequestServices = httpContext.RequestServices;
                    s.UserContext = new GraphQLUserContext
                    {
                        User = httpContext.User,
                    };
                    s.CancellationToken = httpContext.RequestAborted;
                }
            });

            if (result.Errors != null)
            {
                var validationResults = result.Errors.Select(e => new ValidationResult(e.FullMessage())).ToList();
                throw new AbpValidationException(string.Join("\r\n", validationResults.Select(r => r.ErrorMessage)), validationResults);
            }
            return result;
        }

        private async Task<string> GetGqlTopLevelPropertiesAsync(Type entityType, bool fullReference = false)
        {
            var sb = new StringBuilder();
            var properties = (await EntityConfigCache.GetEntityPropertiesAsync(entityType))
                .Where(x => !x.Suppress);
            foreach (var property in properties)
            {
                AppendProperty(sb, property, fullReference);
            }

            sb.AppendLine("id");

            sb.AppendLine(EntityConstants.ClassNameField);
            sb.AppendLine(EntityConstants.DisplayNameField);

            return sb.ToString();
        }

        private void AppendProperty(StringBuilder sb, EntityPropertyDto property, bool fullReference = false)
        {
            // todo: use FieldNameConverter to get correct case of the field names
            var propertyName = StringHelper.ToCamelCase(property.Name);

            switch (property.DataType)
            {

                case DataTypes.Array:
                    if (property.DataFormat == ArrayFormats.MultivalueReferenceList
                        || property.DataFormat == ArrayFormats.ChildObjects)
                    {
                        sb.AppendLine(propertyName);
                        break;
                    }
                    else
                        return; // todo: implement other types
                case DataTypes.EntityReference:
                    if (fullReference || property.EntityType.IsNullOrWhiteSpace())
                    {
                        // GenericEntityReference
                        //sb.AppendLine($"{propertyName}: {propertyName}");
                        sb.Append(propertyName);
                        sb.AppendLine(" {id _className _displayName} ");
                    }
                    else
                        // EntityReference
                        sb.AppendLine($"{propertyName}: {propertyName}{nameof(IEntity.Id)}");
                    break;

                case DataTypes.Object:
                    {
                        sb.Append(propertyName);
                        sb.AppendLine("{");
                        foreach (var subProp in property.Properties)
                        {
                            AppendProperty(sb, subProp);
                        }
                        sb.AppendLine("}");
                        break;
                    }
                default:
                    sb.AppendLine(propertyName);
                    break;
            }
        }

        private async Task<string> CleanupPropertiesAsync(Type entityType, string properties)
        {
            if (string.IsNullOrWhiteSpace(properties))
                return properties;

            var regex = new Regex(@"[\s,]+");
            var props = string.Join(' ', regex.Split(properties).Select(p => StringHelper.ToCamelCase(p)));

            var propList = props.Replace("{", " { ").Replace("}", " } ").Split(" ");

            var sb = new StringBuilder();

            await AppendPropertiesAsync(sb, entityType.FullName, propList.Where(x => !x.IsNullOrWhiteSpace()).ToList());

            return "id " + sb.ToString();
        }

        private async Task AppendPropertiesAsync(StringBuilder sb, string entityType, List<string> propList)
        {
            int i = 0;
            var entityConfig = EntityConfigurationStore.Get(entityType);

            var propConfigs = entityConfig != null
                ? await EntityConfigCache.GetEntityPropertiesAsync(entityConfig.EntityType.FullName)
                : null;

            while (i < propList.Count)
            {
                var prop = propList[i];
                var propConfig = propConfigs?.FirstOrDefault(x => x.Name.ToLower() == prop.ToLower());

                if (i + 1 < propList.Count && propList[i + 1] == "{")
                {
                    int brace = 1;
                    var innerProps = new List<string>();

                    i = i + 2;
                    while (brace > 0)
                    {
                        if (propList[i] == "{") brace++;
                        if (propList[i] == "}") brace--;
                        if (brace > 0) innerProps.Add(propList[i]);
                        i++;
                    }
                    if (propConfig?.EntityType.IsNullOrWhiteSpace() ?? true)
                        sb.Append(prop + " { " + string.Join(" ", innerProps) + " } ");
                    else
                    {
                        sb.Append(prop);
                        // skip Json properties because only whole Json data is allowed to be retrieved
                        if (propConfig.DataType != DataTypes.Object)
                        {
                            sb.Append(" { id ");
                            await AppendPropertiesAsync(sb, propConfig.EntityType, innerProps.Where(x => !x.IsNullOrWhiteSpace()).ToList());
                            sb.Append(" } ");
                        }
                        else
                            sb.Append(" ");
                    }
                    continue;
                }
                if (propConfig != null)
                    AppendProperty(sb, propConfig);
                else
                    sb.Append($"{prop} ");
                i++;
            }
        }
    }
}
