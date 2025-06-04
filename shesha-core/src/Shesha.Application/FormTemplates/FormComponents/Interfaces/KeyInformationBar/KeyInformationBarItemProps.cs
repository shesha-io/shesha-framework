using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents.Interfaces.KeyInformationBar
{
    public class KeyInformationBarItemProps
    {
        public string id { get; set; }
        public List<ConfigurableComponent> components { get; set; } = new List<ConfigurableComponent>();
    }
}
