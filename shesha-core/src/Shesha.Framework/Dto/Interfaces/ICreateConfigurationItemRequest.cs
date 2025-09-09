using System;
using System.Collections.Generic;

namespace Shesha.Dto.Interfaces
{
    /// <summary>
    /// Create Configuration Item request
    /// </summary>
    public interface ICreateConfigurationItemRequest
    {
        /// <summary>
        /// Module Id
        /// </summary>
        Guid ModuleId { get; }
        /// <summary>
        /// Containing folder Id
        /// </summary>
        Guid? FolderId { get; }

        /// <summary>
        /// Item type
        /// </summary>
        string ItemType { get; }

        /// <summary>
        /// ConfigurationItem name
        /// </summary>
        string Name { get; }

        /// <summary>
        /// Optional Id of previous Configuration Item. If specified a new item will be inserted after item with the specified <see cref="PrevItemId"/>
        /// </summary>
        public Guid? PrevItemId { get; set; }
    }
}
