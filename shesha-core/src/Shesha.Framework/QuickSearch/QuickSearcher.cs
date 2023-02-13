using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Runtime.Caching;
using Shesha.Configuration.Runtime;
using Shesha.Domain;
using Shesha.JsonLogic;
using Shesha.Reflection;
using Shesha.Services;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;

namespace Shesha.QuickSearch
{
    /// <summary>
    /// Entity quick searcher
    /// </summary>
    public class QuickSearcher: IQuickSearcher, ITransientDependency
    {
        private readonly IEntityConfigurationStore _entityConfigurationStore;
        private readonly ICacheManager _cacheManager;
        private readonly IRepository<ReferenceListItem, Guid> _refListItemRepository;
        private readonly IReferenceListHelper _refListHelper;

        private readonly MethodInfo stringContainsMethod = typeof(string).GetMethod(nameof(string.Contains), new Type[] { typeof(string) });
        private readonly MethodInfo queryableAnyMethod = typeof(Queryable).GetMethods().FirstOrDefault(m => m.Name == nameof(Queryable.Any) && m.GetParameters().Count() == 2);

        public QuickSearcher(IEntityConfigurationStore entityConfigurationStore, IRepository<ReferenceListItem, Guid> refListItemRepository, ICacheManager cacheManager, IReferenceListHelper refListHelper)
        {
            _entityConfigurationStore = entityConfigurationStore;
            _refListItemRepository = refListItemRepository;
            _cacheManager = cacheManager;
            _refListHelper = refListHelper;
        }

        /// <summary>
        /// Cache of the quick search properties
        /// </summary>
        protected ITypedCache<string, List<QuickSearchPropertyInfo>> QuickSearchPropertiesCache => _cacheManager.GetCache<string, List<QuickSearchPropertyInfo>>(nameof(QuickSearchPropertiesCache));

        /// <summary>
        /// Get quick search expression for the specified entity type <typeparamref name="T"/>
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="quickSearch">Quick search text</param>
        /// <param name="properties">List of properties in dot notation (e.g. FirstName, User.Username, AccountType)</param>
        /// <returns></returns>
        public Expression<Func<T, bool>> GetQuickSearchExpression<T>(string quickSearch, List<string> properties) 
        {
            var itemExpression = Expression.Parameter(typeof(T), "ent");
            var conditions = GetQuickSearchExpression<T>(quickSearch, properties, itemExpression);
            if (conditions.CanReduce)
            {
                conditions = conditions.ReduceAndCheck();
            }

            var query = Expression.Lambda<Func<T, bool>>(conditions, itemExpression);
            return query;
        }

        /// <summary>
        /// Get quick search linq expression. Uses root level properties of the specified entity
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="quickSearch">Quick search text</param>
        /// <returns></returns>
        public Expression<Func<T, bool>> GetQuickSearchExpression<T>(string quickSearch)
        {
            var properties = GetTopLevelProperties<T>();
            return GetQuickSearchExpression<T>(quickSearch, properties);
        }

        /// <summary>
        /// Get quick search expression for the specified entity type <typeparamref name="T"/>
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="quickSearch">Quick search text</param>
        /// <param name="properties">List of properties in dot notation (e.g. FirstName, User.Username, AccountType)</param>
        /// <param name="parameter">Parameter expression</param>
        /// <returns></returns>
        public Expression GetQuickSearchExpression<T>(string quickSearch, List<string> properties, ParameterExpression parameter) 
        {
            if (string.IsNullOrWhiteSpace(quickSearch))
                return null;
            if (parameter is null)
            {
                throw new ArgumentNullException(nameof(parameter));
            }

            var subExpressions = new List<Expression>();
            
            // get list of properties existing in the table configuration
            var props = GetPropertiesForSqlQuickSearch<T>(properties, null);

            if (!props.Any())
                return Expression.Lambda<Func<T, bool>>(Expression.IsTrue(Expression.Constant(false)), parameter);

            foreach (var prop in props)
            {
                switch (prop.DataType)
                {
                    case GeneralDataType.Text:
                        {
                            var propExpression = ExpressionExtensions.GetMemberExpression(parameter, prop.Name);
                            var constExpression = Expression.Constant(quickSearch);

                            var containsExpression = Expression.Call(
                                    propExpression,
                                    stringContainsMethod,
                                    constExpression);

                            subExpressions.Add(containsExpression);
                            break;
                        }
                    case GeneralDataType.EntityReference:
                        {
                            var nestedProperty = ReflectionHelper.GetProperty(typeof(T), prop.Name);
                            if (nestedProperty != null)
                            {
                                var nestedEntityConfig = _entityConfigurationStore.Get(nestedProperty.PropertyType);
                                if (nestedEntityConfig.DisplayNamePropertyInfo != null)
                                {
                                    var nestedPropertyDisplayName = nestedEntityConfig.DisplayNamePropertyInfo.Name;

                                    var propExpression = ExpressionExtensions.GetMemberExpression(parameter, $"{prop.Name}.{nestedPropertyDisplayName}");
                                    var constExpression = Expression.Constant(quickSearch);

                                    // note: `in` arguments are reversed
                                    var containsExpression = Expression.Call(
                                            propExpression,
                                            stringContainsMethod,
                                            constExpression);

                                    subExpressions.Add(containsExpression);
                                }
                            }
                            break;
                        }
                    case GeneralDataType.ReferenceList:
                        {
                            if (!string.IsNullOrWhiteSpace(prop.ReferenceListName))
                            {
                                var reflistExpression = GetCommonRefListExpression(
                                    prop.ReferenceListModule,
                                    prop.ReferenceListName,
                                    prop.Name,
                                    quickSearch,
                                    parameter,
                                    (propValue, itemValue) => Expression.Equal(propValue, itemValue)
                                );

                                var query = _refListItemRepository.GetAll();

                                var anyMethod = typeof(Queryable).GetMethods().FirstOrDefault(m => m.Name == nameof(Queryable.Any) && m.GetParameters().Count() == 2);
                                var anyGeneric = anyMethod.MakeGenericMethod(typeof(ReferenceListItem));

                                var call = Expression.Call(
                                    anyGeneric,
                                    Expression.Constant(query),
                                    reflistExpression);

                                subExpressions.Add(call);
                            }
                            break;
                        }
                    case GeneralDataType.MultiValueReferenceList:
                        {
                            if (!string.IsNullOrWhiteSpace(prop.ReferenceListName))
                            {
                                var reflistExpression = GetCommonRefListExpression(
                                    prop.ReferenceListModule, 
                                    prop.ReferenceListName, 
                                    prop.Name, 
                                    quickSearch, 
                                    parameter, 
                                    (propValue, itemValue) => {
                                        var bitwiseExpression = Expression.And(propValue, itemValue);
                                        return Expression.GreaterThan(bitwiseExpression, Expression.Convert(Expression.Constant(0), typeof(Int64?)));
                                    }
                                );

                                var query = _refListItemRepository.GetAll();
                                // add filter according to the mode

                                var anyGeneric = queryableAnyMethod.MakeGenericMethod(typeof(ReferenceListItem));

                                var call = Expression.Call(
                                    anyGeneric,
                                    Expression.Constant(query),
                                    reflistExpression);

                                subExpressions.Add(call);
                            }
                            break;
                        }
                }
            }
            
            if (!subExpressions.Any())
                return null;

            return CombineExpressions(subExpressions, Expression.OrElse, parameter);
        }

        /// <summary>
        /// Apply quick search to a specified <paramref name="queryable"/>
        /// </summary>
        /// <typeparam name="TEntity">Type of entity</typeparam>
        /// <param name="queryable">Queryable to be filtered</param>
        /// <param name="quickSearch">Quick search text</param>
        /// <param name="properties">List of properties to search. Supports dot notation (e.g. User.Username)</param>
        /// <returns></returns>
        public IQueryable<TEntity> ApplyQuickSearch<TEntity>(IQueryable<TEntity> queryable, string quickSearch, List<string> properties) 
        {
            var expression = GetQuickSearchExpression<TEntity>(quickSearch, properties);
            return queryable.Where(expression);
        }

        /// <summary>
        /// Apply quick search to a specified <paramref name="queryable"/>. Searches by root level properties of the specified entity
        /// </summary>
        /// <typeparam name="TEntity">Type of entity</typeparam>
        /// <param name="queryable">Queryable to be filtered</param>
        /// <param name="quickSearch">Quick search text</param>
        /// <returns></returns>
        public IQueryable<TEntity> ApplyQuickSearch<TEntity>(IQueryable<TEntity> queryable, string quickSearch)
        {
            var expression = GetQuickSearchExpression<TEntity>(quickSearch);
            return queryable.Where(expression);
        }

        #region private declarations

        /// <summary>
        /// Delegate that returns comparison rule for the reference list item
        /// </summary>
        /// <param name="entityPropertyExpression">Entity property expression</param>
        /// <param name="refListItemExpression">Reference list item value expression</param>
        /// <returns></returns>
        private delegate Expression RefListItemComparer(Expression entityPropertyExpression, Expression refListItemExpression);

        /// <summary>
        /// Get common reference list item comparison expression
        /// </summary>
        /// <param name="module">Reference list module</param>
        /// <param name="name">Reference list name</param>
        /// <param name="propName">Name of the entity property</param>
        /// <param name="quickSearch">Quick search text</param>
        /// <param name="entityExpression">Entity parameter expression (i.e. `e` part in the `e => foo`)</param>
        /// <param name="comparer">Comparison rule</param>
        /// <returns></returns>
        private Expression GetCommonRefListExpression(string module, string name, string propName, string quickSearch, ParameterExpression entityExpression, RefListItemComparer comparer)
        {
            var refList = _refListHelper.GetReferenceList(new ReferenceListIdentifier(module, name));

            var param = Expression.Parameter(typeof(ReferenceListItem), $"ent{propName}");

            var listIdExpr = Expression.Equal(ExpressionExtensions.GetMemberExpression(param, $"{nameof(ReferenceListItem.ReferenceList)}.{nameof(ReferenceList.Id)}"), Expression.Constant(refList.Id));

            var propExpression = ExpressionExtensions.GetMemberExpression(entityExpression, propName);
            var valuePredicateExpr = comparer.Invoke(
                Expression.Convert(propExpression, typeof(Int64?)),
                Expression.Convert(ExpressionExtensions.GetMemberExpression(param, nameof(ReferenceListItem.ItemValue)), typeof(Int64?))
            );

            var constExpression = Expression.Constant(quickSearch);

            var itemTextExpr = ExpressionExtensions.GetMemberExpression(param, nameof(ReferenceListItem.Item));
            var containsExpression = Expression.Call(
                                    itemTextExpr,
                                    stringContainsMethod,
                                    constExpression);

            var expr = CombineExpressions(new List<Expression> { listIdExpr, valuePredicateExpr, containsExpression }, Expression.AndAlso, entityExpression);

            var query = Expression.Lambda<Func<ReferenceListItem, bool>>(expr, param);

            return query;
            /*
            var moduleExpr = string.IsNullOrWhiteSpace(module)
                ? Expression.Equal(ExpressionExtensions.GetMemberExpression(param, $"{nameof(ReferenceListItem.ReferenceList)}.{nameof(ReferenceListItem.ReferenceList.Configuration)}.{nameof(ReferenceListItem.ReferenceList.Configuration.Module)}"), Expression.Constant(null))
                : Expression.Equal(ExpressionExtensions.GetMemberExpression(param, $"{nameof(ReferenceListItem.ReferenceList)}.{nameof(ReferenceListItem.ReferenceList.Configuration)}.{nameof(ReferenceListItem.ReferenceList.Configuration.Module)}.{nameof(ReferenceListItem.ReferenceList.Configuration.Module.Name)}"), Expression.Constant(module));

            var nameExpr = Expression.Equal(ExpressionExtensions.GetMemberExpression(param, $"{nameof(ReferenceListItem.ReferenceList)}.{nameof(ReferenceListItem.ReferenceList.Configuration)}.{nameof(ReferenceListItem.ReferenceList.Configuration.Name)}"), Expression.Constant(name));

            var propExpression = ExpressionExtensions.GetMemberExpression(entityExpression, propName);
            var valuePredicateExpr = comparer.Invoke(
                Expression.Convert(propExpression, typeof(Int64?)),
                Expression.Convert(ExpressionExtensions.GetMemberExpression(param, nameof(ReferenceListItem.ItemValue)), typeof(Int64?))
            );

            var constExpression = Expression.Constant(quickSearch);

            var itemTextExpr = ExpressionExtensions.GetMemberExpression(param, nameof(ReferenceListItem.Item));
            var containsExpression = Expression.Call(
                                    itemTextExpr,
                                    stringContainsMethod,
                                    constExpression);

            var expr = CombineExpressions(new List<Expression> { moduleExpr, nameExpr, valuePredicateExpr, containsExpression }, Expression.AndAlso, entityExpression);

            var query = Expression.Lambda<Func<ReferenceListItem, bool>>(expr, param);

            return query;
            */
        }

        /// <summary>
        /// Commin binder of two expression
        /// </summary>
        /// <param name="left">Left expression</param>
        /// <param name="right">Right expression</param>
        /// <returns></returns>
        private delegate Expression Binder(Expression left, Expression right);

        /// <summary>
        /// Combine expressions list using specified <paramref name="binder"/>
        /// </summary>
        /// <param name="expressions">List of expressions to bind</param>
        /// <param name="binder">Binder (e.g. Expression.OrElse)</param>
        /// <param name="param">Parameter expression (i.e. `e` part in the `e => foo`)</param>
        /// <returns></returns>
        private Expression CombineExpressions(List<Expression> expressions, Binder binder, ParameterExpression param)
        {
            Expression acc = null;

            Expression bind(Expression acc, Expression right) => acc == null ? right : binder(acc, right);

            foreach (var expression in expressions)
            {
                acc = bind(acc, expression);
            }

            return acc;
        }

        /// <summary>
        /// Get detailed properties information required for quick search
        /// </summary>
        /// <typeparam name="TEntity">Type of entity</typeparam>
        /// <param name="properties">List of properties in dot notation (e.g. FirstName, User.Username, AccountType)</param>
        /// <param name="cacheKey">Cache key. Live null to skip caching</param>
        /// <returns></returns>
        private List<QuickSearchPropertyInfo> GetPropertiesForSqlQuickSearch<TEntity>(List<string> properties, string cacheKey)
        {
            if (string.IsNullOrWhiteSpace(cacheKey))
                return DoGetPropertiesForSqlQuickSearch<TEntity>(properties);

            return QuickSearchPropertiesCache.Get(cacheKey, (s) => DoGetPropertiesForSqlQuickSearch<TEntity>(properties));
        }

        private bool TryGetProperty(EntityConfiguration entityConfig, string name, out PropertyConfiguration propConfig) 
        {
            if (name == EntityConstants.DisplayNameField) 
            {
                propConfig = null;

                var displayNameProp = entityConfig.DisplayNamePropertyInfo?.Name;
                return displayNameProp != null && entityConfig.Properties.TryGetValue(displayNameProp, out propConfig);
            }

            if (entityConfig.Properties.TryGetValue(name, out propConfig))
                return true;

            // try to search using camel case
            var key = entityConfig.Properties.Keys.FirstOrDefault(k => k.ToCamelCase() == name);
            return key != null && entityConfig.Properties.TryGetValue(key, out propConfig);
        }

        /// <summary>
        /// Get detailed properties information required for quick search
        /// </summary>
        /// <typeparam name="TEntity">Type of entity</typeparam>
        /// <param name="properties">List of properties in dot notation (e.g. FirstName, User.Username, AccountType)</param>
        /// <returns></returns>
        private List<QuickSearchPropertyInfo> DoGetPropertiesForSqlQuickSearch<TEntity>(List<string> properties)
        {
            var entityConfig = _entityConfigurationStore.Get(typeof(TEntity));

            var props = properties
                .Select(propName =>
                {
                    var effectivePathParts = new List<string>();

                    var currentEntityConfig = entityConfig;
                    PropertyConfiguration property = null;
                    if (propName.Contains('.'))
                    {
                        var parts = propName.Split('.');

                        for (int i = 0; i < parts.Length; i++)
                        {
                            if (!TryGetProperty(currentEntityConfig, parts[i], out property))
                                return null;

                            if (!property.IsMapped)
                                return null;

                            // all parts except the latest - entity reference
                            // all parts mapped

                            if (property.GeneralType == GeneralDataType.EntityReference)
                            {
                                currentEntityConfig = _entityConfigurationStore.Get(property.PropertyInfo.PropertyType);
                            }
                            else
                                if (i != parts.Length - 1)
                                return null; // only last part can be not an entity reference

                            effectivePathParts.Add(property.PropertyInfo.Name);
                        }
                    }
                    else {
                        TryGetProperty(currentEntityConfig, propName, out property);
                        if (property != null)
                            effectivePathParts.Add(property.PropertyInfo.Name);
                    }

                    if (property == null)
                        return null;

                    /*
                    if (property.PropertyInfo.Name == currentEntityConfig.CreatedUserPropertyInfo?.Name ||
                        property.PropertyInfo.Name == currentEntityConfig.LastUpdatedUserPropertyInfo?.Name ||
                        property.PropertyInfo.Name == currentEntityConfig.InactivateUserPropertyInfo?.Name)
                        return null;
                    */

                    if (!property.IsMapped)
                        return null;
                    
                    return new
                    {
                        Path = effectivePathParts.Delimited("."),
                        Property = property,
                        ReferenceListModule = property.ReferenceListModule,
                        ReferenceListName = property.ReferenceListName
                    };
                })
                .Where(i => i != null)
                .Select(i => new QuickSearchPropertyInfo()
                {
                    Name = i.Path,
                    DataType = i.Property.GeneralType,
                    ReferenceListModule = i.ReferenceListModule,
                    ReferenceListName = i.ReferenceListName
                })
                .ToList();

            return props;
        }

        /// <summary>
        /// Get names of the root level properties
        /// </summary>
        /// <typeparam name="TEntity"></typeparam>
        /// <returns></returns>
        public List<string> GetTopLevelProperties<TEntity>() 
        {
            var entityConfig = _entityConfigurationStore.Get(typeof(TEntity));
            return entityConfig.Properties.Select(p => p.Key).ToList();
        }

        #endregion
    }
}
