using System.Collections.Generic;

namespace Shesha.DelayedUpdate
{
    public class DelayedUpdateItem
    {
        public required object Id { get; set; }
        public object? Data { get; set; }
    }

    public class DelayedUpdateGroup
    {
        public required string Name { get; set; }
        public List<DelayedUpdateItem> Items { get; set; } = new();
    }
}
