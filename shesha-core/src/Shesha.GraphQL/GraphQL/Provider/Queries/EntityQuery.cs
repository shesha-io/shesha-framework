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
using Npgsql;
using Shesha.Application.Services.Dto;
using Shesha.Configuration.Runtime;
using Shesha.Configuration.Runtime.Exceptions;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.GraphQL.Dtos;
using Shesha.GraphQL.Provider.GraphTypes;
using Shesha.JsonLogic;
using Shesha.NHibernate;
using Shesha.QuickSearch;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Specifications;
using Shesha.Utilities;
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;

namespace Shesha.GraphQL.Provider.Queries
{
    /// <summary>
    /// Entity query
    /// </summary>
    public class EntityQuery<TEntity, TId> : ObjectGraphType, ITransientDependency where TEntity : class, IEntity<TId>, new()
    {
        private readonly IJsonLogic2LinqConverter _jsonLogicConverter;
        private readonly IEntityConfigurationStore _entityConfigStore;
        private readonly ISessionProvider _sessionProvider;

        public EntityQuery(IServiceProvider serviceProvider)
        {
            var entityName = StringHelper.ToCamelCase(typeof(TEntity).Name);

            Name = entityName + "Query";

            _jsonLogicConverter = serviceProvider.GetRequiredService<IJsonLogic2LinqConverter>();
            _entityConfigStore = serviceProvider.GetRequiredService<IEntityConfigurationStore>();
            _sessionProvider = serviceProvider.GetRequiredService<ISessionProvider>();

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
                    query.SetReadOnly();

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

            FieldAsync<PagedResultDtoType<TEntity>>($"{entityName}Tree",
                arguments: new QueryArguments(
                    new QueryArgument<GraphQLInputGenericType<TreeRequestDto>> { Name = "input", DefaultValue = new TreeRequestDto() }
                ),
                resolve: async context => {
                    var input = context.GetArgument<TreeRequestDto>("input");

                    var unitOfWorkManager = serviceProvider.GetRequiredService<IUnitOfWorkManager>();
                    var uow = unitOfWorkManager.Current;

                    if (input.ParentId.HasValue)
                    {
                        var entityConfig = _entityConfigStore.Get(typeof(TEntity));
                        var idColumnName = MappingHelper.GetColumnName(entityConfig.EntityType.GetRequiredProperty(nameof(IEntity.Id)));
                        var isDeletedColumnName = typeof(ISoftDelete).IsAssignableFrom(entityConfig.EntityType)
                            ? MappingHelper.GetColumnName(entityConfig.EntityType.GetRequiredProperty(nameof(ISoftDelete.IsDeleted)))
                            : null;

                        var parentProperty = entityConfig.EntityType.GetPropertyWithPath(input.ParentProperty, true);
                        if (parentProperty == null)
                            throw new ArgumentException($"Property '{input.ParentProperty}' not found in entity '{entityConfig.EntityType.FullName}'");
                        if (!parentProperty.PropertyInfo.PropertyType.IsEntityType())
                            throw new ArgumentException($"Property '{input.ParentProperty}' of entity '{entityConfig.EntityType.FullName}' is not an entity");
                        if (parentProperty.Path.Count > 1)
                            throw new NotSupportedException($"Nested entities are not supported. Property '{input.ParentProperty}' is nested.");

                        var parentPropertyColumnName = MappingHelper.GetForeignKeyColumn(parentProperty.PropertyInfo);

                        var treeEntities = await GetTreeQueryAsync(entityConfig.TableName, parentPropertyColumnName, idColumnName, isDeletedColumnName, input.ParentId);

                        // filter entities
                        var entities = !string.IsNullOrWhiteSpace(input.Filter)
                            ? AddFilter(treeEntities.AsQueryable(), input.Filter).ToList()
                            : treeEntities.ToList();

                        var result = new PagedResultDto<TEntity>
                        {
                            Items = entities,
                            TotalCount = entities.Count,
                        };

                        return result;
                    }
                    else {
                        var query = repository.GetAll();
                        query.SetReadOnly();

                        // filter entities
                        query = AddFilter(query, input.Filter);

                        var entities = entityFetcher != null
                            ? await entityFetcher.ToListAsync(query, GetEntityPropertiesFromContext(context))
                            : await asyncExecuter.ToListAsync(query);

                        var result = new PagedResultDto<TEntity>
                        {
                            Items = entities,
                            TotalCount = entities.Count,
                        };

                        return result;

                    }
                }
            );
        }

        private DbmsType GetDbmsType()
        {
            return _sessionProvider.Session.Connection is NpgsqlConnection
                ? DbmsType.PostgreSQL
                : DbmsType.SQLServer;
        }

        private async Task<IList<TEntity>> GetTreeQueryAsync(string tableName, string parentIdColumnName, string idColumnName, string? isDeletedColumnName, Guid? parentId)
        {
            var sql = GenerateTreeSubnodesQuery(tableName, parentIdColumnName, idColumnName, isDeletedColumnName, GetDbmsType());

            var entities = await _sessionProvider.Session.CreateSQLQuery(sql)
                     .AddEntity("ent", typeof(TEntity))
                     .SetParameter("id", parentId)
                     .SetReadOnly(true)
                     .ListAsync<TEntity>();
            return entities;
        }

        private string GetIsDeletedClause(string tableAlias, string? columnName, DbmsType dbmsType)
        {
            if (string.IsNullOrEmpty(columnName))
                return string.Empty;

            return dbmsType switch
            {
                DbmsType.SQLServer => $"and {tableAlias}.\"{columnName}\" = 0",
                DbmsType.PostgreSQL => $"and {tableAlias}.\"{columnName}\" = false",
                _ => throw new NotSupportedException($"Database type {dbmsType} is not supported"),
            };
        }

        private string GenerateTreeSubnodesQuery(string tableName, string parentIdColumnName, string idColumnName, string? isDeletedColumnName, DbmsType dbmsType)
        {
            tableName = tableName.Trim('"');

            var sql = @$"with {(dbmsType == DbmsType.PostgreSQL ? "recursive" : "")} subtree_cte as (
    -- Anchor
    SELECT 
        t.""{idColumnName}"", 
        t.""{parentIdColumnName}"", 
        0 AS level
    FROM ""{tableName}"" t
    WHERE t.""{idColumnName}"" = :id

    UNION ALL

    -- Recursive
    SELECT 
        t.""{idColumnName}"",
        t.""{parentIdColumnName}"",
        cte.level + 1
    FROM 
		""{tableName}"" t
		INNER JOIN subtree_cte cte ON t.""{parentIdColumnName}"" = cte.""{idColumnName}"" {GetIsDeletedClause("t", isDeletedColumnName, dbmsType)}
)
select 
	ent.*
from
    ""{tableName}"" ent
    inner join subtree_cte on subtree_cte.""{idColumnName}"" = ent.""{idColumnName}""
";

            return sql;
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
