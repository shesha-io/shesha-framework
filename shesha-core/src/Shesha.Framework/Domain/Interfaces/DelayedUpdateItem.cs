using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain.Interfaces
{
    public class DelayedUpdateItem
    {
        public object Id { get; set; }
        public object Data { get; set; }
    }

    public class DelayedUpdateGroup
    {
        public string Name { get; set; }
        public List<DelayedUpdateItem> Items { get; set; }
    }
}
