using System;

namespace Shesha.Specifications
{
    /// <summary>
    /// Stores basic information about specifications
    /// </summary>
    public interface ISpecificationInfo: ISpecificationBaseInfo
    {
        /// <summary>
        /// If true, indicates that this specification is global
        /// </summary>
        bool IsGlobal { get; }

        /// <summary>
        /// If true, indicates that this specification is available on the client (front-end application)
        /// </summary>
        bool IsAvailableOnClient { get; }

        /// <summary>
        /// Name
        /// </summary>
        string Name { get; }

        /// <summary>
        /// Friendly name
        /// </summary>
        string FriendlyName { get; }

        /// <summary>
        /// Description
        /// </summary>
        string Description { get; }
    }
}
