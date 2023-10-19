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
    /// Add filter SoftDelete 
    /// </summary>
    public class SoftDeleteFilter
    {
        /// <summary>
        /// Returns filter definition
        /// </summary>
        public static FilterDefinition GetDefinition()
        {
            var defaultColumnName = nameof(ISoftDelete.IsDeleted);

            var filterDef = new FilterDefinition(
                AbpDataFilters.SoftDelete,
                GetCondition(defaultColumnName),
                new Dictionary<string, IType>
                {
                    { AbpDataFilters.Parameters.IsDeleted, NHibernateUtil.Boolean }
                },
                false);
            return filterDef;
        }

        /// <summary>
        /// Get filtering condition
        /// </summary>
        /// <param name="columnName">Name of the `IsDeleted` column</param>
        /// <returns></returns>
        public static string GetCondition(string columnName)
        {
            return $"{columnName.EscapeDbObjectNameForNH()} = :{AbpDataFilters.Parameters.IsDeleted}";
        }
    }
}