using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    /// <summary>
    /// Versioned field definition
    /// </summary>
    [Entity(CrudActions = CrudActions.None, IsConfigurable = false)]
    public class VersionedField : FullPowerChildEntity
    {
        /// <summary>
        /// Field name
        /// </summary>
        public virtual string Name { get; set; }

        /// <summary>
        /// Defines whether full versions history is tracked and stored or not
        /// </summary>
        public virtual bool TrackVersions { get; set; }
    }
}
