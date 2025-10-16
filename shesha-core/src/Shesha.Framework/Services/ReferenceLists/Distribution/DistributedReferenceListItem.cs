using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.Services.ReferenceLists.Distribution
{
    /// <summary>
    /// Distributed reference list item
    /// </summary>
    public class DistributedReferenceListItem : IEquatable<DistributedReferenceListItem>
    {
        /// <summary>
        /// Item text
        /// </summary>
        public string? Item { get; set; }

        /// <summary>
        /// Item value
        /// </summary>
        public Int64 ItemValue { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Order index
        /// </summary>
        public Int64 OrderIndex { get; set; }

        /// <summary>
        /// If true, indicates that this item is hardly linked to the application code
        /// </summary>
        public bool HardLinkToApplication { get; set; }

        /// <summary>
        /// Assicoated color
        /// </summary>
        public string? Color { get; set; }

        /// <summary>
        /// Assiciated icon
        /// </summary>
        public string? Icon { get; set; }

        /// <summary>
        /// Short alias
        /// </summary>
        public string? ShortAlias { get; set; }

        /// <summary>
        /// Child items
        /// </summary>
        public List<DistributedReferenceListItem> ChildItems { get; set; } = new List<DistributedReferenceListItem>();

        private bool StringEauqls(string? a, string? b) => string.IsNullOrEmpty(a) && string.IsNullOrEmpty(b) || a == b;

        public bool Equals(DistributedReferenceListItem? other)
        {
            if (other == null)
                return false;

            var equals = StringEauqls(Item, other.Item) &&
                ItemValue == other.ItemValue &&
                StringEauqls(Description, other.Description) &&
                OrderIndex == other.OrderIndex &&
                // HardLinkToApplication == other.HardLinkToApplication &&
                StringEauqls(Color, other.Color ) &&
                StringEauqls(Icon, other.Icon) &&
                StringEauqls(ShortAlias, other.ShortAlias);
            if (!equals)
                return false;

            if (ChildItems.Count != other.ChildItems.Count)
                return false;

            var childOrdered = ChildItems.OrderBy(item => item.OrderIndex).ToList();
            var otherChildOrdered = other.ChildItems.OrderBy(item => item.OrderIndex).ToList();

            for (int i = 0; i < childOrdered.Count; i++)
            {
                if (!childOrdered[i].Equals(otherChildOrdered[i]))
                    return false;
            }
            return true;
        }
    }
}
