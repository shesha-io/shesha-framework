using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain;
using Shesha.Extensions;
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
        public static IQueryable<TItem> FilterByFullName<TItem>(this IQueryable<TItem> queryable, string? module, string name) where TItem : ConfigurationItem 
        {
            return queryable.Where(new ByNameAndModuleSpecification<TItem>(name, module).ToExpression());
        }

        public static IQueryable<TItem> FilterByApplication<TItem>(this IQueryable<TItem> queryable, string? appKey) where TItem : ConfigurationItem, IMayHaveFrontEndApplication
        {
            return queryable.Where(new ByApplicationSpecification<TItem>(appKey).ToExpression());
        }

        public static IQueryable<TItem> GetByByFullName<TItem>(this IRepository<TItem, Guid> repository, string? module, string name) where TItem : ConfigurationItem 
        {
            return repository.GetAll().FilterByFullName(module, name);
        }

        /// <summary>
        /// Get <see cref="ConfigurationItem"/> by <paramref name="module"/>, <paramref name="name"/>
        /// </summary>
        public static Task<TItem> GetItemByFullNameAsync<TItem>(this IQueryable<TItem> queryable, string? module, string name) where TItem : ConfigurationItem 
        {
            var query = queryable.FilterByFullName(module, name);
            return query.FirstOrDefaultAsync();
        }

        /// <summary>
        /// Get <see cref="ConfigurationItem"/> by <paramref name="module"/>, <paramref name="name"/>
        /// </summary>
        public static Task<TItem> GetItemByFullNameAsync<TItem>(this IRepository<TItem, Guid> repository, string module, string name) where TItem : ConfigurationItem
        {
            return repository.GetAll().GetItemByFullNameAsync(module, name);
        }

        /// <summary>
        /// Get <see cref="ConfigurationItem"/> by <paramref name="id"/>
        /// </summary>
        public static Task<TItem> GetItemByIdAsync<TItem>(this IRepository<TItem, Guid> repository, ConfigurationItemIdentifier id) where TItem : ConfigurationItem 
        {
            // TODO: make result nullable and add an override with not nullable result
            return repository.GetAll().GetItemByIdAsync(id);
        }

        /// <summary>
        /// Get <see cref="ConfigurationItem"/> by <paramref name="id"/>
        /// </summary>
        public static Task<TItem> GetItemByIdAsync<TItem>(this IQueryable<TItem> queryable, ConfigurationItemIdentifier id) where TItem : ConfigurationItem 
        {
            return queryable.GetItemByFullNameAsync(id.Module, id.Name);
        }
    }
}
