using Abp.Dependency;
using Abp.Linq;
using NHibernate.Linq;
using Shesha.Extensions;
using Shesha.GraphQL.Provider;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;
using ReflectionHelper = Shesha.Reflection.ReflectionHelper;

namespace Shesha.GraphQL.NHibernate
{
    /// <summary>
    /// NHibernate entity fetcher
    /// </summary>
    public class NHibernateEntityFetcher : IEntityFetcher, ITransientDependency
    {
        private readonly IAsyncQueryableExecuter _asyncExecuter;

        public NHibernateEntityFetcher(IAsyncQueryableExecuter asyncExecuter)
        {
            _asyncExecuter = asyncExecuter;
        }

        public Task<List<T>> ToListAsync<T>(IQueryable<T> queryable, List<string> properties)
        {
            IQueryable<T> fetcher = null;

            foreach (var propName in properties) 
            {
                var property = ReflectionHelper.GetProperty(typeof(T), propName, useCamelCase: true);
                if (property != null && property.PropertyType.IsEntityType()) 
                {
                    fetcher = FetchNested(fetcher ?? queryable, propName);
                }
            }

            return fetcher != null
                ? fetcher.ToListAsync()
                : _asyncExecuter.ToListAsync(queryable); // fallback to IAsyncQueryableExecuter
        }

        private IQueryable<T> FetchNested<T>(IQueryable<T> queryable, string propName)
        {
            var parts = propName.Split('.');
            var firstPart = parts.First();

            var property = ReflectionHelper.GetProperty(typeof(T), firstPart, useCamelCase: true);
            if (property != null && property.PropertyType.IsEntityType())
            {
                var method = typeof(NHibernateEntityFetcher).GetMethod(nameof(MakeFetch), BindingFlags.Static | BindingFlags.Public);
                var invoker = method.MakeGenericMethod(typeof(T), property.PropertyType);
                var fetcher = invoker.Invoke(null, new object[] { queryable, firstPart }) as IQueryable<T>;

                var nestedParts = parts.Skip(1).ToArray();
                if (nestedParts.Any())
                {
                    var currentType = property.PropertyType;
                    foreach (var nestedPart in nestedParts)
                    {
                        var nestedProperty = ReflectionHelper.GetProperty(currentType, nestedPart, useCamelCase: true);
                        if (nestedProperty != null && nestedProperty.PropertyType.IsEntityType())
                        {
                            var nestMethod = typeof(NHibernateEntityFetcher).GetMethod(nameof(MakeFetchNested), BindingFlags.Static | BindingFlags.Public);
                            var nestInvoker = nestMethod.MakeGenericMethod(typeof(T), currentType, nestedProperty.PropertyType);
                            fetcher = nestInvoker.Invoke(null, new object[] { fetcher, nestedPart }) as IQueryable<T>;

                            currentType = nestedProperty.PropertyType;
                        }
                    }
                }

                return fetcher;
            }
            else
                return queryable;
        }

        public static IQueryable<T> MakeFetch<T, TRelated>(IQueryable<T> queryable, string propName)
        {
            var argParam = Expression.Parameter(typeof(T), "ent");
            var memberAccess = Shesha.JsonLogic.ExpressionExtensions.GetMemberExpression(argParam, propName);

            var expr = Expression.Lambda<Func<T, TRelated>>(memberAccess, argParam);
            return queryable.Fetch(expr);
        }

        public static IQueryable<TQueried> MakeFetchNested<TQueried, TFetch, TRelated>(INhFetchRequest<TQueried, TFetch> fetcher, string propName)
        {
            var argParam = Expression.Parameter(typeof(TFetch), "ent");
            var memberAccess = Shesha.JsonLogic.ExpressionExtensions.GetMemberExpression(argParam, propName);

            var expr = Expression.Lambda<Func<TFetch, TRelated>>(memberAccess, argParam);
            return fetcher.ThenFetch(expr);
        }
    }
}
