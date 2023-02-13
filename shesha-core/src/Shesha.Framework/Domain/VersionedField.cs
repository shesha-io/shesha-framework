using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    /// <summary>
    /// Versioned field definition
    /// </summary>
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
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
