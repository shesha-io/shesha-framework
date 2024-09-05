using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.DeferredUpdate
{
    public class DeferredUpdateItem
    {
        public object Id { get; set; }
        public object Data { get; set; }
    }

    public class DeferredUpdateGroup
    {
        public string Name { get; set; }
        public List<DeferredUpdateItem> Items { get; set; }
    }
}
