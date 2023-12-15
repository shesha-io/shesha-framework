using System.Collections.Generic;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Entities reordering request
    /// </summary>
    public class ReorderRequest
    {
        /// <summary>
        /// Type of entity
        /// </summary>
        public string EntityType { get; set; }

        /// <summary>
        /// Name of the property that should be recalculated
        /// </summary>
        public string PropertyName { get; set; }

        /// <summary>
        /// List of reordering items. 
        /// Note 1: and order of the items is important, it's used as a final order. 
        /// Note 2: existing values of the OrderIndex are redistributed between entities
        /// </summary>
        public List<ReorderingItem> Items { get; set; }
    }
}
