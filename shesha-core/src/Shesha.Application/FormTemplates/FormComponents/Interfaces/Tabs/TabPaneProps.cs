using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents.Interfaces.Tabs
{
    public class TabPaneProps
    {
        public string id { get; set; }
        public string type { get; set; }
        public string key { get; set; }
        public string name { get; set; }
        public string title { get; set; }
        public bool hidden { get; set; }
        public string editMode { get; set; }
        public string selectMode { get; set; }
        public List<ConfigurableComponent> components { get; set; }
    }
}
