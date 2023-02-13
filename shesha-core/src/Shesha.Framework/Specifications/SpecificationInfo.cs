using System;

namespace Shesha.Specifications
{
    /// <summary>
    /// Stores basic information about specifications
    /// </summary>
    public class SpecificationInfo: ISpecificationInfo
    {
        /// <summary>
        /// Type of specifications
        /// </summary>
        public Type SpecificationsType { get; set; }

        /// <summary>
        /// Type of Entity
        /// </summary>
        public Type EntityType { get; set; }

        /// <summary>
        /// If true, indicates that this specification is global
        /// </summary>
        public bool IsGlobal { get; set; }

        /// <summary>
        /// If true, indicates that this specification is available on the client (front-end application)
        /// </summary>
        public bool IsAvailableOnClient { get; set; }
        
        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }
        
        /// <summary>
        /// Friendly name
        /// </summary>
        public string FriendlyName { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }
    }
}
