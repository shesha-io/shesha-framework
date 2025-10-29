using Abp.Application.Services.Dto;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.Linq;
using GraphQL;
using GraphQL.Types;
using GraphQLParser.AST;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Linq;
using Shesha.Application.Services.Dto;
using Shesha.Configuration.Runtime;
using Shesha.Configuration.Runtime.Exceptions;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.GraphQL.Dtos;
using Shesha.GraphQL.Provider.GraphTypes;
using Shesha.JsonLogic;
using Shesha.QuickSearch;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Specifications;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace Shesha.GraphQL.Provider.Queries
{
    /// <summary>
    /// Entity query
    /// </summary>
    public class EntityQuery<TEntity, TId> : ObjectGraphType, ITransientDependency where TEntity : class, IEntity<TId>
    {
        private readonly IJsonLogic2LinqConverter _jsonLogicConverter;
        private readonly IEntityTypeConfigurationStore _entityConfigStore;

        public EntityQuery(IServiceProvider serviceProvider)
        {
            var entityName = StringHelper.ToCamelCase(typeof(TEntity).Name);

            Name = entityName + "Query";

            _jsonLogicConverter = serviceProvider.GetRequiredService<IJsonLogic2LinqConverter>();
            _entityConfigStore = serviceProvider.GetRequiredService<IEntityTypeConfigurationStore>();

            var repository = serviceProvider.GetRequiredService<IRepository<TEntity, TId>>();
            var asyncExecuter = serviceProvider.GetRequiredService<IAsyncQueryableExecuter>();
            var entityFetcher = serviceProvider.GetService<IEntityFetcher>();
            var quickSearcher = serviceProvider.GetRequiredService<IQuickSearcher>();
            var specificationManager = serviceProvider.GetRequiredService<ISpecificationManager>();

            FieldAsync<GraphQLGenericType<TEntity>>(entityName,
                arguments: new QueryArguments(new QueryArgument(MakeGetInputType()) { Name = nameof(IEntity.Id) }),
                resolve: async context => {
                    var id = context.GetArgument<TId>(nameof(IEntity.Id));

                    return await repository.GetAsync(id);
                }                    
            );

            FieldAsync<PagedResultDtoType<TEntity>>($"{entityName}List",
                arguments: new QueryArguments(
                    new QueryArgument<GraphQLInputGenericType<ListRequestDto>> { Name = "input", DefaultValue = new ListRequestDto() }
                ),
                resolve: async context => {
                    var input = context.GetArgument<ListRequestDto>("input");

                    var unitOfWorkManager = serviceProvider.GetRequiredService<IUnitOfWorkManager>();
                    var uow = unitOfWorkManager.Current;

                    var query = repository.GetAll();

                    // apply specifications
                    query = specificationManager.ApplySpecifications(query, input.Specifications);

                    // filter entities
                    query = AddFilter(query, input.Filter);

                    // add quick search
                    if (!string.IsNullOrWhiteSpace(input.QuickSearch))
                        query = quickSearcher.ApplyQuickSearch(query, input.QuickSearch, input.QuickSearchProperties);

                    // calculate total count
                    var totalCount = query.Count();

                    // apply sorting
                    query = ApplySorting(query, input.Sorting);

                    // apply paging
                    var pageQuery = query.Skip(input.SkipCount);
                    if (input.MaxResultCount > 0)
                        pageQuery = pageQuery.Take(input.MaxResultCount);

                    var entities = entityFetcher != null
                        ? await entityFetcher.ToListAsync(pageQuery, GetEntityPropertiesFromContext(context))
                        : await asyncExecuter.ToListAsync(pageQuery);

                    var result = new PagedResultDto<TEntity> {
                        Items = entities,
                        TotalCount = totalCount
                    };

                    return result;
                }
            );
        }

        private List<string> GetEntityPropertiesFromContext(IResolveFieldContext context) 
        {
            var itemsName = StringHelper.ToCamelCase(nameof(PagedResultDto<TEntity>.Items));
            if (context.SubFields.ContainsKey(itemsName))
            {
                var itemsField = context.SubFields[itemsName];
                var fields = itemsField.Field.SelectionSet?.Selections.OfType<GraphQLField>().ToList();
                if (fields != null)
                {
                    return GetDotNotationFieldsList(fields);
                }
            }
            return new List<string>();
        }

        private List<string> GetDotNotationFieldsList(List<GraphQLField> fields) 
        {
            var properties = new List<string>();

            foreach (var field in fields) 
            {
                ProcessField(field, (nestedField, path) => {
                    properties.Add(PrefixName(nestedField.Name.ToString(), path));
                }, null);
            }            

            return properties;
        }

        private string PrefixName(string name, string prefix) 
        {
            return string.IsNullOrWhiteSpace(prefix)
                ? name
                : prefix + "." + name;
        }

        private void ProcessField(GraphQLField field, Action<GraphQLField, string> fieldAction, string path)
        {
            fieldAction.Invoke(field, path);
            if (field.SelectionSet != null) 
            {
                foreach (var selection in field.SelectionSet.Selections) 
                {
                    if (selection is GraphQLField nestedField) 
                    {
                        var nestedPath = PrefixName(field.Name.ToString(), path);
                        
                        ProcessField(nestedField, fieldAction, nestedPath);
                    }
                }
            }
        }

        /// <summary>
        /// Add filter to <paramref name="query"/>
        /// </summary>
        /// <param name="query">Queryable to be filtered</param>
        /// <param name="filter">String representation of JsonLogic filter</param>
        /// <returns></returns>
        private IQueryable<TEntity> AddFilter(IQueryable<TEntity> query, string filter) 
        {
            if (string.IsNullOrWhiteSpace(filter))
                return query;

            var jsonLogic = JObject.Parse(filter);

            var expression = _jsonLogicConverter.ParseExpressionOf<TEntity>(jsonLogic);

            return expression != null
                ? query.Where(expression)
                : query;
        }

        /// <summary>
        /// Apply sorting to <paramref name="query"/>
        /// </summary>
        /// <param name="query">Queryable to be sorted</param>
        /// <param name="sorting">Sorting string (in the standard SQL format e.g. "Property1 asc, Property2 desc")</param>
        /// <returns></returns>
        private IQueryable<TEntity> ApplySorting(IQueryable<TEntity> query, string sorting)
        {
            if (string.IsNullOrWhiteSpace(sorting))
                return query;

            var sortColumns = sorting.Split(',').Select(c => c.Trim()).Where(c => !string.IsNullOrWhiteSpace(c)).ToList();
            var sorted = false;
            foreach (var sortColumn in sortColumns)
            {
                var column = sortColumn.LeftPart(' ', ProcessDirection.LeftToRight);
                if (string.IsNullOrWhiteSpace(column))
                    continue;

                if (column == EntityConstants.DisplayNameField)
                {
                    var entityConfig = _entityConfigStore.Get(typeof(TEntity));
                    if (entityConfig.DisplayNamePropertyInfo == null)
                        throw new EntityDisplayNameNotFoundException(typeof(TEntity));

                    column = entityConfig.DisplayNamePropertyInfo.Name;
                }

                var direction = sortColumn.RightPart(' ', ProcessDirection.LeftToRight)?.Trim().Equals("desc", StringComparison.InvariantCultureIgnoreCase) == true
                    ? ListSortDirection.Descending
                    : ListSortDirection.Ascending;

                // special handling for entities - sort them by display name if available
                var property = ReflectionHelper.GetProperty(typeof(TEntity), column, useCamelCase: true);
                if (property != null && property.PropertyType.IsEntityType()) 
                {
                    var displayNameProperty = property.PropertyType.GetEntityConfiguration()?.DisplayNamePropertyInfo;
                    if (displayNameProperty != null) 
                    {
                        column = $"{column}.{displayNameProperty.Name}";
                    }
                }                    

                if (sorted)
                {
                    if (!(query is IOrderedQueryable<TEntity> orderedQuery))
                        throw new Exception($"Query must implement {nameof(IOrderedQueryable)} to allow sort by multiple columns");

                    // already sorted (it's not a first sorting column)
                    switch (direction)
                    {
                        case ListSortDirection.Ascending:
                            query = orderedQuery.ThenBy(column);
                            break;
                        case ListSortDirection.Descending:
                            query = orderedQuery.ThenByDescending(column);
                            break;
                    }
                }
                else
                {
                    switch (direction)
                    {
                        case ListSortDirection.Ascending:
                            query = query.OrderBy(column);
                            break;
                        case ListSortDirection.Descending:
                            query = query.OrderByDescending(column);
                            break;
                    }
                }
                sorted = true;
            }
            
            return query;
        }
        
        private static Type MakeGetInputType()
        {
            return GraphTypeMapper.GetGraphType(typeof(TId), true, true);
        }
    }
}
