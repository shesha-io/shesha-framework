using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    /// <summary>
    /// Version definition of a versioned field
    /// </summary>
    [Entity(CrudActions = CrudActions.None, IsConfigurable = false)]
    public class VersionedFieldVersion : FullPowerEntity
    {
        /// <summary>
        /// Field link
        /// </summary>
        public virtual VersionedField Field { get; set; }

        /// <summary>
        /// Value content
        /// </summary>
        [StringLength(int.MaxValue)]
        public virtual string Content { get; set; }

        /// <summary>
        /// Is true for last version
        /// Note: updated by triggers in sql server side
        /// </summary>
        public virtual bool IsLast { get; protected set; }

    }
}
