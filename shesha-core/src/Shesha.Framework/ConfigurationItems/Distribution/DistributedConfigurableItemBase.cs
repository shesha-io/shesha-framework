using Shesha.Domain.ConfigurationItems;
using System;

namespace Shesha.ConfigurationItems.Distribution
{
    /// <summary>
    /// Base model of the configurable item
    /// </summary>
    public class DistributedConfigurableItemBase
    {
        /// <summary>
        /// Identifier
        /// </summary>
        public Guid? Id { get; set; }

        /// <summary>
        /// The Guid for the Config Item.
        /// Different versions for the same Config Item will share this Id which the very first version of the item will be responsible for generating.
        /// </summary>
        public Guid? OriginId { get; set; }

        /// <summary>
        /// Item name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Label of the con
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// Item name
        /// </summary>
        public string ItemType { get; set; }

        /// <summary>
        /// Item description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Module name
        /// </summary>
        public string ModuleName { get; set; }

        /// <summary>
        /// Front-end application name
        /// </summary>
        public string FrontEndApplication { get; set; }

        /// <summary>
        /// Base item. Is used if the current item is inherited from another one
        /// </summary>
        public Guid? BaseItem { get; set; }

        /// <summary>
        /// Version number
        /// </summary>
        public int VersionNo { get; set; }

        /// <summary>
        /// Version status (Draft/In Progress/Live etc.)
        /// </summary>
        public ConfigurationItemVersionStatus VersionStatus { get; set; }

        /// <summary>
        /// Parent version. Note: version may have more than one child versions (e.g. new version was created and then cancelled, in this case a new version should be created in the same parent)
        /// </summary>
        public Guid? ParentVersionId { get; set; }

        /// <summary>
        /// If true, it means that the item will not be visible to Config or End-users/Admins.
        /// </summary>
        public bool Suppress { get; set; }
    }
}
