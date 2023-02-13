using JetBrains.Annotations;
using System;
using System.Collections.Generic;

namespace Shesha.Domain
{
    public class FilterCriteria : ICloneable
    {
        public enum FilterMethod
        {
            DynamicLinq,
            Hql,
        }

        public FilterCriteria(FilterCriteria.FilterMethod filteringMethod)
        {
            Init();
            FilteringMethod = filteringMethod;
        }

        private void Init()
        {
            FilterClauses = new List<string>();
            FilterParameters = new Dictionary<string, object>();
            FilteringMethod = FilterMethod.DynamicLinq;
        }

        public FilterMethod FilteringMethod { get; protected set; }
        public List<string> FilterClauses { get; protected set; }
        public Dictionary<string, object> FilterParameters { get; protected set; }

        /// <summary>
        /// Copies all the <paramref name="criteria"/>'s FilterClauses and FilterParameters to this
        /// FilterCriteria.
        /// </summary>
        /// <param name="criteria"></param>
        public void AppendCriteria([NotNull]FilterCriteria criteria)
        {
            if (criteria.FilteringMethod != this.FilteringMethod)
                throw new Exception("The filtering method used is incompatible and may cause problems due to differences in syntax.");

            FilterClauses.AddRange(criteria.FilterClauses);

            foreach (var param in criteria.FilterParameters)
            {
                FilterParameters.Add(param.Key, param.Value);
            }
        }

        /// <summary>
        /// Adds a criterion to the criteria.
        /// </summary>
        /// <param name="criterionPattern">String specifying the criterion e.g. 'ent.PropertyName = {0}'
        /// where:
        /// - it is assumed that ent is the alias assigned to the root entity being queried.
        /// - {0} indicates the position where the parameter will be inserted. The parameter name will be automatically assigned.</param>
        /// <param name="parameterValue">The parameter value.</param>
        public void AddParameterisedCriterion(string criterionPattern, object parameterValue)
        {
            var queryParamName = "p" + FilterParameters.Count.ToString();
            FilterClauses.Add(string.Format(criterionPattern, ":" + queryParamName));
            FilterParameters.Add(queryParamName, parameterValue);
        }

        #region ICloneable Members

        public object Clone()
        {
            var clone = new FilterCriteria(FilteringMethod);

            clone.FilteringMethod = FilteringMethod;
            foreach (var o in FilterClauses)
                clone.FilterClauses.Add(o);
            foreach (var o in FilterParameters)
                clone.FilterParameters.Add(o.Key, o.Value); // Assumes that the value is a value type or else will still be referencing the same object which presents a slight risk i.e. changes on the clone will impact changes on the original copy.

            return clone;
        }

        #endregion
    }

}
