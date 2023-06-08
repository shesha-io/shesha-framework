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
    /// Add filter MayHaveTenant 
    /// </summary>
    public class MayHaveTenantFilter
    {
        /// <summary>
        /// Returns filter definition
        /// </summary>
        public static FilterDefinition GetDefinition()
        {

            var filterDef = new FilterDefinition(
                AbpDataFilters.MayHaveTenant,
                $"({nameof(IMayHaveTenant.TenantId).DoubleQuote()} = :{AbpDataFilters.Parameters.TenantId} or {nameof(IMayHaveTenant.TenantId).DoubleQuote()} is null and :{AbpDataFilters.Parameters.TenantId} is null)",
                new Dictionary<string, IType>
                {
                    { AbpDataFilters.Parameters.TenantId, NHibernateUtil.Int32 }
                },
                false);
            return filterDef;
        }
    }
}