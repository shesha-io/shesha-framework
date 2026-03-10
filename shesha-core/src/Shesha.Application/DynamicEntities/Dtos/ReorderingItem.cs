using System;

namespace Shesha.DynamicEntities.Dtos
{
    /// <summary>
    /// Reordering item
    /// </summary>
    public class ReorderingItem: ReorderingItem<string, double?>
    {
    }

    public class ReorderingItem<TId, TOrder>
    {
        public TId Id { get; set; }
        public TOrder OrderIndex { get; set; }
    }
}
