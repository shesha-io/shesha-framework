using System.ComponentModel.DataAnnotations;
using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    /// <summary>
    /// Filter expression type
    /// </summary>
    [ReferenceList("Shesha.Framework", "FilterExpressionType")]
    public enum RefListFilterExpressionType
    {
        /// <summary>
        /// HQL (either hand-written or built with JsonLogic)
        /// </summary>
        Hql = 1,
        /// <summary>
        /// JsonLogic expression. It can be converted to HQL when needed
        /// </summary>
        [Display(Name = "JsonLogic")]
        JsonLogic = 2,
        /// <summary>
        /// A filter for a single column. Mostly used in the reporting framework for stuff like the following: filtering the report data to only show data from current user's unit.
        /// </summary>
        Column = 3,
        /// <summary>
        /// Used for saved Advanced filters or sub-filters, also used in the reporting framework and can be used for reusable HQL queries
        /// </summary>
        LegacyAdvanced = 4,
        /// <summary>
        /// Code filters (see ICustomStoredFilterRegistration)
        /// </summary>
        CodeFilter = 5
    }
}