using JetBrains.Annotations;
using System;
using System.Collections.Generic;

namespace Shesha.Domain.QueryBuilder
{
    /// <summary>
    /// Query building context
    /// </summary>
    public class QueryBuildingContext
    {
        [NotNull]
        public FilterCriteria FilterCriteria { get; private set; }

        [NotNull]
        public Type RootClass { get; private set; }

        public List<JoinClause> Joins { get; private set; } = new List<JoinClause>();

        public string OrderBy { get; set; }

        public QueryBuildingContext(Type rootClass)
        {
            RootClass = rootClass;
            FilterCriteria = new FilterCriteria(FilterCriteria.FilterMethod.Hql);
        }
    }
}
