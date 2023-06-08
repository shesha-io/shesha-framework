using Abp.Domain.Entities;
using Abp.Domain.Uow;
using NHibernate;
using NHibernate.Engine;
using NHibernate.Type;
using Shesha.Utilities;
using System.Collections.Generic;

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
                $"({nameof(IMustHaveTenant.TenantId).DoubleQuote()} = :{AbpDataFilters.Parameters.TenantId} or {nameof(IMustHaveTenant.TenantId).DoubleQuote()} is null and :{AbpDataFilters.Parameters.TenantId} is null)",
                new Dictionary<string, IType>
                {
                    { AbpDataFilters.Parameters.TenantId, NHibernateUtil.Int32 }
                },
                false);
            return filterDef;
        }
    }
}