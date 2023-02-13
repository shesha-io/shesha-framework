using System.Collections.Generic;
using Abp.Domain.Entities;
using Abp.Domain.Uow;
using NHibernate;
using NHibernate.Engine;
using NHibernate.Type;

namespace Shesha.NHibernate.Filters
{
    /// <summary>
    /// Add filter MustHaveTenant 
    /// </summary>
    public class MustHaveTenantFilter
    {
        /// <summary>
        /// Returns filter definition
        /// </summary>
        public static FilterDefinition GetDefinition()
        {

            var filterDef = new FilterDefinition(
                AbpDataFilters.MustHaveTenant,
                $"({nameof(IMustHaveTenant.TenantId)} = :{AbpDataFilters.Parameters.TenantId} or {nameof(IMustHaveTenant.TenantId)} is null and :{AbpDataFilters.Parameters.TenantId} is null)",
                new Dictionary<string, IType>
                {
                    { AbpDataFilters.Parameters.TenantId, NHibernateUtil.Int32 }
                },
                false);
            return filterDef;
        }
    }
}