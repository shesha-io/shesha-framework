using Shesha.Domain.Attributes;

namespace Shesha.Domain.ConfigurationItems
{
    /// <summary>
    /// Status of the <see cref="ConfigurationItem"/>
    /// </summary>
    [ReferenceList("Shesha.Framework", "ConfigurationItemVersionStatus")]
    public enum ConfigurationItemVersionStatus
    {
        /// <summary>
        /// Version is still a work in progress
        /// </summary>
        Draft = 1,

        /// <summary>
        /// Configuration changes for this version have been completed but is awaiting to made live
        /// </summary>
        Ready = 2,

        /// <summary>
        /// Version is currently Live
        /// </summary>
        Live = 3,

        /// <summary>
        /// Version was set to ‘Ready’ but was decided that it should not go live
        /// </summary>
        Cancelled = 4,

        /// <summary>
        /// Version was previously Live but has been retired
        /// </summary>
        Retired = 5,
    }
}
