using Abp.Domain.Entities;
using Abp.Domain.Uow;
using NHibernate;
using NHibernate.Engine;
using NHibernate.Type;
using System.Collections.Generic;

namespace Shesha.NHibernate.Filters
{
    /// <summary>
    /// Add filter SoftDelete 
    /// </summary>
    public class SoftDeleteFilter
    {
        /// <summary>
        /// Returns filter definition
        /// </summary>
        public static FilterDefinition GetDefinition()
        {

            var filterDef = new FilterDefinition(
                AbpDataFilters.SoftDelete,
                $"{nameof(ISoftDelete.IsDeleted)} = :{AbpDataFilters.Parameters.IsDeleted}",
                new Dictionary<string, IType>
                {
                    { AbpDataFilters.Parameters.IsDeleted, NHibernateUtil.Boolean }
                },
                false);
            return filterDef;
        }
    }
}