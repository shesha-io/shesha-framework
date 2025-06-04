using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents.Interfaces.Tabs
{
    public class TabsProps: ConfigurableComponent
    {
        public string tabType { get; set; }
        public string defaultActiveKey { get; set; }
        public List<TabPaneProps> tabs { get; set; }
    }
}
