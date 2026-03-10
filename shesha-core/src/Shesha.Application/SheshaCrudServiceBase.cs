using Abp.Application.Services.Dto;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Runtime.Validation;
using GraphQL;
using Microsoft.AspNetCore.Mvc;
using Shesha.Application.Services;
using Shesha.Application.Services.Dto;
using Shesha.Attributes;
using Shesha.Configuration.Runtime;
using Shesha.DynamicEntities;
using Shesha.DynamicEntities.Cache;
using Shesha.DynamicEntities.Dtos;
using Shesha.Exceptions;
using Shesha.Extensions;
using Shesha.GraphQL.Middleware;
using Shesha.GraphQL.Mvc;
using Shesha.GraphQL.Provider;
using Shesha.Metadata;
using Shesha.QuickSearch;
using Shesha.Reflection;
using Shesha.Specifications;
using Shesha.Utilities;
using Shesha.Web;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Shesha
{
    public abstract class SheshaCrudServiceBase<TEntity, TEntityDto, TPrimaryKey> : SheshaCrudServiceBase<TEntity,
        TEntityDto, TPrimaryKey, FilteredPagedAndSortedResultRequestDto, TEntityDto, TEntityDto>
        where TEntity : class, IEntity<TPrimaryKey>
        where TEntityDto : IEntityDto<TPrimaryKey>
        where TPrimaryKey : notnull
    {
        protected SheshaCrudServiceBase(IRepository<TEntity, TPrimaryKey> repository) : base(repository)
        {
        }
    }


    /// <summary>
    /// CRUD service base
    /// </summary>
    public abstract class SheshaCrudServiceBase<TEntity, TEntityDto, TPrimaryKey, TGetAllInput, TCreateInput, TUpdateInput> : SheshaCrudServiceBase<TEntity, TEntityDto, TPrimaryKey, TGetAllInput, TCreateInput, TUpdateInput, EntityDto<TPrimaryKey>>
        where TEntity : class, IEntity<TPrimaryKey>
        where TEntityDto : IEntityDto<TPrimaryKey>
        where TUpdateInput : IEntityDto<TPrimaryKey>
        where TGetAllInput : FilteredPagedAndSortedResultRequestDto
        where TPrimaryKey : notnull
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="repository"></param>
        protected SheshaCrudServiceBase(IRepository<TEntity, TPrimaryKey> repository)
            : base(repository)
        {
        }
    }

    /// <summary>
    /// CRUD service base
    /// </summary>
    public abstract class SheshaCrudServiceBase<TEntity, TEntityDto, TPrimaryKey, TGetAllInput, TCreateInput, TUpdateInput, TGetInput> : AbpAsyncCrudAppService<TEntity, TEntityDto, TPrimaryKey, TGetAllInput, TCreateInput, TUpdateInput, TGetInput>, IEntityAppService<TEntity, TPrimaryKey>
        where TEntity : class, IEntity<TPrimaryKey>
        where TEntityDto : IEntityDto<TPrimaryKey>
        where TUpdateInput : IEntityDto<TPrimaryKey>
        where TGetAllInput : FilteredPagedAndSortedResultRequestDto
        where TGetInput : IEntityDto<TPrimaryKey>
        where TPrimaryKey : notnull
    {
        public IQuickSearcher QuickSearcher { get; set; } = new NullQuickSearcher();
        public ISpecificationManager SpecificationManager { get; set; } = NullSpecificationManager.Instance;

        [EntityAction(StandardEntityActions.Create)]
        public override Task<TEntityDto> CreateAsync(TCreateInput input)
        {
            return base.CreateAsync(input);
        }

        [EntityAction(StandardEntityActions.Read)]
        public override Task<TEntityDto> GetAsync(TGetInput input)
        {
            return base.GetAsync(input);
        }

        [EntityAction(StandardEntityActions.Update)]
        public override Task<TEntityDto> UpdateAsync(TUpdateInput input)
        {
            return base.UpdateAsync(input);
        }

        [EntityAction(StandardEntityActions.Delete)]
        public override async Task DeleteAsync(EntityDto<TPrimaryKey> input)
        {
            var entity = await Repository.GetAsync(input.Id);
            await DeleteCascadeAsync(entity);
            await base.DeleteAsync(input);
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="repository"></param>
        protected SheshaCrudServiceBase(IRepository<TEntity, TPrimaryKey> repository)
            : base(repository)
        {
        }

        protected override IQueryable<TEntity> CreateFilteredQuery(TGetAllInput input)
        {
            var query = Repository.GetAll();

            // apply specifications
            query = SpecificationManager.ApplySpecifications(query, input.Specifications);

            query = query.ApplyFilter<TEntity, TPrimaryKey>(input.Filter);

            if (this.QuickSearcher != null && !string.IsNullOrWhiteSpace(input.QuickSearch))
                query = this.QuickSearcher.ApplyQuickSearch(query, input.QuickSearch);

            return query;
        }

        //[HttpGet]
        [EntityAction(StandardEntityActions.List)]
        public override async Task<PagedResultDto<TEntityDto>> GetAllAsync(TGetAllInput input)
        {
            CheckGetAllPermission();

            var query = CreateFilteredQuery(input);

            var totalCount = await AsyncQueryableExecuter.CountAsync(query);

            query = ApplySorting(query, input);
            query = ApplyPaging(query, input);

            var entities = await AsyncQueryableExecuter.ToListAsync(query);

            return new PagedResultDto<TEntityDto>(
                totalCount,
                entities.Select(MapToEntityDto).ToList()
            );
        }

        #region GraphQL

        /// <summary>
        /// GraphQL document executer
        /// </summary>
        public IDocumentExecuter DocumentExecuter { get; set; }
        public ISchemaContainer SchemaContainer { get; set; }
        public IGraphQLSerializer Serializer { get; set; }
        public IEntityConfigCache EntityConfigCache { get; set; }
        public IEntityTypeConfigurationStore EntityConfigurationStore { get; set; }

        /// <summary>
        /// Query entity data. 
        /// NOTE: don't use on prod, this is merged with the `Get`endpoint
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <response code="200">NOTE: shape of the `result` depends on the `properties` argument. When `properties` argument is not specified - it returns top level properties of the entity, all referenced entities are presented as their Id values</response>
        [HttpGet]
        [ApiExplorerSettings(IgnoreApi = true)]
        public virtual async Task<GraphQLDataResult<TEntity>> QueryAsync(GetDynamicEntityInput<TPrimaryKey> input)
        {
            CheckGetAllPermission();

            var schemaName = StringHelper.ToCamelCase(typeof(TEntity).Name);

            var schema = await SchemaContainer.GetOrDefaultAsync(schemaName);
            var httpContext = AppContextHelper.Current;

            var properties = string.IsNullOrWhiteSpace(input.Properties)
                    ? await GetGqlTopLevelPropertiesAsync()
                    : await CleanupPropertiesAsync(input.Properties);

            var query = input.Id.GetType() == typeof(Int64)
                || input.Id.GetType() == typeof(Int32)
                || input.Id.GetType() == typeof(int)
                ? $@"query{{{schemaName}(id: {input.Id}) {{{properties}}}}}"
                : $@"query{{{schemaName}(id: ""{input.Id}"") {{{properties}}}}}";

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
                if (result.Errors.Count() == 1 && result.Errors.First().InnerException is EntityNotFoundException notFoundException)
                    throw notFoundException;

                var validationResults = result.Errors.Select(e => new ValidationResult(e.FullMessage())).ToList();
                throw new AbpValidationException(string.Join("\r\n", validationResults.Select(r => r.ErrorMessage)), validationResults);
            }

            return new GraphQLDataResult<TEntity>(result);
        }

        /// <summary>
        /// Query entities list
        /// NOTE: don't use on prod, this is merged with the `GetAll`endpoint
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        /// <response code="200">NOTE: shape of the `items[]` depends on the `properties` argument. When `properties` argument is not specified - it returns top level properties of the entity, all referenced entities are presented as their Id values</response>
        [HttpGet]
        [ApiExplorerSettings(IgnoreApi = true)]
        public virtual async Task<GraphQLDataResult<PagedResultDto<TEntity>>> QueryAllAsync(PropsFilteredPagedAndSortedResultRequestDto input)
        {
            CheckGetAllPermission();

            var schemaName = StringHelper.ToCamelCase(typeof(TEntity).Name);

            var schema = await SchemaContainer.GetOrDefaultAsync(schemaName);
            var httpContext = AppContextHelper.Current;

            var properties = string.IsNullOrWhiteSpace(input.Properties)
                ? await GetGqlTopLevelPropertiesAsync(true)
                : await CleanupPropertiesAsync(input.Properties);

            var query = $@"query getAll($filter: String, $quickSearch: String, $quickSearchProperties: [String], $sorting: String, $skipCount: Int, $maxResultCount: Int, $specifications: [String]){{
              {schemaName}List(input: {{ filter: $filter, quickSearch: $quickSearch, quickSearchProperties: $quickSearchProperties, sorting: $sorting, skipCount: $skipCount, maxResultCount: $maxResultCount, specifications: $specifications }}){{
                totalCount
                items {{
                    {properties}
                }}
              }}
            }}";

            var result = await DocumentExecuter.ExecuteAsync(s =>
            {
                s.Schema = schema;

                s.Query = query;
                s.Variables = new Inputs(new Dictionary<string, object?> {
                    { "filter", input.Filter },
                    { "specifications", input.Specifications },
                    { "quickSearch", input.QuickSearch },
                    { "quickSearchProperties", ExtractProperties(properties) },
                    { "sorting", input.Sorting },
                    { "skipCount", input.SkipCount },
                    { "maxResultCount", input.MaxResultCount },
                });

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

            return new GraphQLDataResult<PagedResultDto<TEntity>>(result);
        }

        private List<string> ExtractProperties(string properties)
        {
            var regex = new Regex(@"\s");
            return regex.Split(properties).ToList();
        }

        private async Task<string> CleanupPropertiesAsync(string properties)
        {
            if (string.IsNullOrWhiteSpace(properties))
                return properties;

            var regex = new Regex(@"[\s,]+");
            var propList = regex.Split(properties.Replace("{", " { ").Replace("}", " } ")).Select(p => StringHelper.ToCamelCase(p));

            var sb = new StringBuilder();
            await AppendPropertiesAsync(sb, typeof(TEntity).GetRequiredFullName(), propList.Where(x => !x.IsNullOrWhiteSpace()).ToList());

            return "id " + sb.ToString();
        }

        private async Task AppendPropertiesAsync(StringBuilder sb, string entityType, List<string> propList)
        {
            int i = 0;
            var entityConfig = EntityConfigurationStore.Get(entityType);

            var propConfigs = entityConfig != null
                ? await EntityConfigCache.GetEntityPropertiesAsync(entityConfig.EntityType.GetRequiredFullName())
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
                    if (propConfig == null 
                        || propConfig.DataType == DataTypes.EntityReference && propConfig.EntityFullClassName.IsNullOrWhiteSpace())
                        sb.Append(prop + " { " + string.Join(" ", innerProps) + " } ");
                    else
                    {
                        sb.Append(prop);
                        // skip Json properties because only whole Json data is allowed to be retrieved
                        if (propConfig.DataType != DataTypes.Object)
                        {
                            sb.Append(" { id ");
                            await AppendPropertiesAsync(sb, propConfig.EntityFullClassName, innerProps.Where(x => !x.IsNullOrWhiteSpace()).ToList());
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

        private void AppendProperty(StringBuilder sb, EntityPropertyDto property, bool fullReference = false)
        {
            // todo: use FieldNameConverter to get correct case of the field names
            var propertyName = StringHelper.ToCamelCase(property.Name);

            switch (property.DataType)
            {
                case DataTypes.Array:
                    switch (property.DataFormat)
                    {
                        case ArrayFormats.Simple:
                        case ArrayFormats.ChildObjects:
                        case ArrayFormats.MultivalueReferenceList:
                            sb.AppendLine(propertyName);
                            break;
                        case ArrayFormats.EntityReference:
                        case ArrayFormats.ManyToManyEntities:
                            sb.Append(propertyName);
                            sb.AppendLine(" {id _className _displayName} ");
                            break;

                            // todo: implement other types
                    }
                    break;
                case DataTypes.EntityReference:
                case DataTypes.File:
                    if (fullReference || property.EntityFullClassName.IsNullOrWhiteSpace())
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
                default:
                    sb.AppendLine(propertyName);
                    break;
            }
        }

        private async Task<string> GetGqlTopLevelPropertiesAsync(bool fullReference = false)
        {
            var sb = new StringBuilder();
            var allEntityProps = await EntityConfigCache.GetEntityPropertiesAsync(typeof(TEntity));
            var properties = allEntityProps.NotNull().Where(x => !x.Suppress);
            foreach (var property in properties)
            {
                AppendProperty(sb, property, fullReference);
            }

            sb.AppendLine("id");

            sb.AppendLine(EntityConstants.ClassNameField);
            sb.AppendLine(EntityConstants.DisplayNameField);

            return sb.ToString();
        }

        async Task<IDynamicDataResult> IEntityAppService.QueryAllAsync(PropsFilteredPagedAndSortedResultRequestDto input)
        {
            return await this.QueryAllAsync(input);
        }

        async Task<IDynamicDataResult> IEntityAppService<TEntity, TPrimaryKey>.QueryAsync(GetDynamicEntityInput<TPrimaryKey> input)
        {
            return await this.QueryAsync(input);
        }

        #endregion

        /// <summary>
        /// Get filtered list of entities
        /// </summary>
        /// <param name="filter">Filter in JsonLogic format</param>
        /// <returns></returns>
        protected async Task<List<TEntity>> GetAllFilteredAsync(string filter)
        {
            return await AsyncQueryableExecuter.ToListAsync(Repository.GetAllFiltered(filter));
        }
    }
}
