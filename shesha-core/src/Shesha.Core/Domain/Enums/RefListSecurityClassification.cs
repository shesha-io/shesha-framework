using Shesha.Domain.Attributes;

namespace Shesha.Domain.Enums
{
    /// <summary>
    /// Security classification
    /// </summary>
    [ReferenceList("Shesha.Core", "SecurityClassification")]
    public enum RefListSecurityClassification
    {
        /// <summary>
        /// Available to everyone
        /// </summary>
        Public = 1,

        /// <summary>
        /// Restricted
        /// </summary>
        Restricted = 2,

        /// <summary>
        /// Confidential
        /// </summary>
        Confidential = 4,

        /// <summary>
        /// Secret
        /// </summary>
        Secret = 8,

        /// <summary>
        /// Top secret
        /// </summary>
        TopSecret = 16
    }
}
