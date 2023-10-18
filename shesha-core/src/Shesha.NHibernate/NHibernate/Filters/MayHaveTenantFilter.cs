using Abp.Domain.Entities;
using Abp.Domain.Uow;
using NHibernate;
using NHibernate.Engine;
using NHibernate.Type;
using Shesha.NHibernate.Utilites;
using System.Collections.Generic;

namespace Shesha.NHibernate.Filters
{
    /// <summary>
    /// Add filter MayHaveTenant 
    /// </summary>
    public class MayHaveTenantFilter
    {
        /// <summary>
        /// Returns filter definition
        /// </summary>
        public static FilterDefinition GetDefinition()
        {
            var defaultColumnName = nameof(IMayHaveTenant.TenantId);

            var filterDef = new FilterDefinition(
                AbpDataFilters.MayHaveTenant,
                GetCondition(defaultColumnName),
                new Dictionary<string, IType>
                {
                    { AbpDataFilters.Parameters.TenantId, NHibernateUtil.Int32 }
                },
                false);
            return filterDef;
        }

        /// <summary>
        /// Get filtering condition
        /// </summary>
        /// <param name="columnName">Name of the `TenantId` column</param>
        /// <returns></returns>
        public static string GetCondition(string columnName) 
        {
            var escapedColumnName = columnName.EscapeDbObjectNameForNH();
            return $"({escapedColumnName} = :{AbpDataFilters.Parameters.TenantId} or {escapedColumnName} is null and :{AbpDataFilters.Parameters.TenantId} is null)";
        }
    }
}