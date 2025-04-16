using Abp.Domain.Repositories;
using Shesha.ConfigurationItems.Models;
using Shesha.ConfigurationItems.Specifications;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
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
        public static IQueryable<TItem> FilterByFullName<TItem>(this IQueryable<TItem> queryable, string? module, string name) where TItem : class, IConfigurationItem 
        {
            return queryable.Where(new ByNameAndModuleSpecification<TItem>(name, module).ToExpression());
        }

        public static IQueryable<TItem> GetByByFullName<TItem>(this IRepository<TItem, Guid> repository, string? module, string name) where TItem : class, IConfigurationItem 
        {
            return repository.GetAll().FilterByFullName(module, name);
        }

        /// <summary>
        /// Get <see cref="IConfigurationItem"/> by <paramref name="module"/>, <paramref name="name"/> and <paramref name="mode"/>
        /// </summary>
        public static async Task<TItem> GetItemByFullNameAsync<TItem>(this IQueryable<TItem> queryable, string? module, string name, ConfigurationItemViewMode mode) where TItem : class, IConfigurationItem 
        {
            var query = queryable.FilterByFullName(module, name);

            switch (mode)
            {
                case ConfigurationItemViewMode.Live:
                default:
                    query = query.Where(f => f.VersionStatus == ConfigurationItemVersionStatus.Live);
                    break;
                case ConfigurationItemViewMode.Ready:
                    {
                        var statuses = new ConfigurationItemVersionStatus[] {
                            ConfigurationItemVersionStatus.Live,
                            ConfigurationItemVersionStatus.Ready
                        };

                        /*
                         *  NOTE: it covers two unobvoius cases:
                         *  1. v1:Retierd v2:Live v3:Draft - there is no Ready version and the Live version is not the latest, but we should return it
                         *  2. v1:Retired v2:Live v3:Ready - we should return Ready
                         */
                        query = query.Where(f => statuses.Contains(f.VersionStatus)).OrderByDescending(f => f.VersionNo);
                        break;
                    }
                case ConfigurationItemViewMode.Latest:
                    {
                        var statuses = new ConfigurationItemVersionStatus[] {
                            ConfigurationItemVersionStatus.Live,
                            ConfigurationItemVersionStatus.Ready,
                            ConfigurationItemVersionStatus.Draft
                        };
                        query = query.Where(f => f.IsLast && statuses.Contains(f.VersionStatus));
                        break;
                    }
            }

            return await query.FirstOrDefaultAsync();
        }

        /// <summary>
        /// Get <see cref="IConfigurationItem"/> by <paramref name="module"/>, <paramref name="name"/> and <paramref name="mode"/>
        /// </summary>
        public static async Task<TItem> GetItemByFullNameAsync<TItem>(this IRepository<TItem, Guid> repository, string module, string name, ConfigurationItemViewMode mode) where TItem : class, IConfigurationItem
        {
            return await repository.GetAll().GetItemByFullNameAsync(module, name, mode);
        }

        /// <summary>
        /// Get <see cref="IConfigurationItem"/> by <paramref name="id"/> and <paramref name="mode"/>
        /// </summary>
        public static async Task<TItem> GetItemByIdAsync<TItem>(this IRepository<TItem, Guid> repository, ConfigurationItemIdentifier id, ConfigurationItemViewMode mode) where TItem : class, IConfigurationItem 
        {
            // TODO: make result nullable and add an override with not nullable result
            return await repository.GetAll().GetItemByIdAsync(id, mode);
        }

        /// <summary>
        /// Get <see cref="IConfigurationItem"/> by <paramref name="id"/> and <paramref name="mode"/>
        /// </summary>
        public static async Task<TItem> GetItemByIdAsync<TItem>(this IQueryable<TItem> queryable, ConfigurationItemIdentifier id, ConfigurationItemViewMode mode) where TItem : class, IConfigurationItem 
        {
            return await queryable.GetItemByFullNameAsync(id.Module, id.Name, mode);
        }
    }
}
