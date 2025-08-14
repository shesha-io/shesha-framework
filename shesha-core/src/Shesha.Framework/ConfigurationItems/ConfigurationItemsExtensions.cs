using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Models;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Reflection;
using Shesha.Services;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Configuration Items generic extensions
    /// </summary>
    public static class ConfigurationItemsExtensions
    {
        public static IQueryable<TItem> FilterByFullName<TItem>(this IQueryable<TItem> queryable, string? module, string name) where TItem : class, IConfigurationItem 
        {
            return queryable.Where(new ByNameAndModuleSpecification<TItem>(name, module).ToExpression());
        }

        public static IQueryable<TItem> FilterByApplication<TItem>(this IQueryable<TItem> queryable, string? appKey) where TItem : class, IConfigurationItem, IMayHaveFrontEndApplication
        {
            return queryable.Where(new ByApplicationSpecification<TItem>(appKey).ToExpression());
        }

        public static IQueryable<TItem> GetByByFullName<TItem>(this IRepository<TItem, Guid> repository, string? module, string name) where TItem : class, IConfigurationItem 
        {
            return repository.GetAll().FilterByFullName(module, name);
        }

        /// <summary>
        /// Get <see cref="IConfigurationItem"/> by <paramref name="module"/>, <paramref name="name"/> and <paramref name="mode"/>
        /// </summary>
        public static Task<TItem> GetItemByFullNameAsync<TItem>(this IQueryable<TItem> queryable, string? module, string name, ConfigurationItemViewMode mode) where TItem : class, IConfigurationItem 
        {
            var query = queryable.FilterByFullName(module, name);
            return query.FirstOrDefaultAsync();
        }

        /// <summary>
        /// Get <see cref="IConfigurationItem"/> by <paramref name="module"/>, <paramref name="name"/> and <paramref name="mode"/>
        /// </summary>
        public static Task<TItem> GetItemByFullNameAsync<TItem>(this IRepository<TItem, Guid> repository, string module, string name, ConfigurationItemViewMode mode) where TItem : class, IConfigurationItem
        {
            return repository.GetAll().GetItemByFullNameAsync(module, name, mode);
        }

        /// <summary>
        /// Get <see cref="IConfigurationItem"/> by <paramref name="id"/> and <paramref name="mode"/>
        /// </summary>
        public static Task<TItem> GetItemByIdAsync<TItem>(this IRepository<TItem, Guid> repository, ConfigurationItemIdentifier id, ConfigurationItemViewMode mode) where TItem : class, IConfigurationItem 
        {
            // TODO: make result nullable and add an override with not nullable result
            return repository.GetAll().GetItemByIdAsync(id, mode);
        }

        /// <summary>
        /// Get <see cref="IConfigurationItem"/> by <paramref name="id"/> and <paramref name="mode"/>
        /// </summary>
        public static Task<TItem> GetItemByIdAsync<TItem>(this IQueryable<TItem> queryable, ConfigurationItemIdentifier id, ConfigurationItemViewMode mode) where TItem : class, IConfigurationItem 
        {
            return queryable.GetItemByFullNameAsync(id.Module, id.Name, mode);
        }

        /// <summary>
        /// Get revision accorind to the current mode
        /// </summary>
        /// <typeparam name="TItem"></typeparam>
        /// <typeparam name="TRevision"></typeparam>
        /// <param name="item"></param>
        /// <returns></returns>
        public static TRevision GetRevision<TItem, TRevision>(this TItem item) where TItem: ConfigurationItem<TRevision> where TRevision : ConfigurationItemRevision, new()
        {
            var cfRuntime = StaticContext.IocManager.Resolve<IConfigurationFrameworkRuntime>();
            var revision = cfRuntime.ViewMode == ConfigurationItemViewMode.Live
                ? item.ActiveRevision.NotNull()
                : item.LatestRevision.NotNull();

            return revision.NotNull();
        }
    }
}
