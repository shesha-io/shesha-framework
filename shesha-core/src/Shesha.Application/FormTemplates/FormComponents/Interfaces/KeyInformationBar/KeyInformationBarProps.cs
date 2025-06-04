using Shesha.FormTemplates.FormComponents.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents.Interfaces.KeyInformationBar
{
    public class KeyInformationBarProps: ConfigurableComponent
    {
        public string width { get; set; }
        public string height { get; set; }
        public string dividerHeight { get; set; }
        public string dividerWidth { get; set; }
        public int dividerMargin { get; set; }
        public string dividerColor { get; set; }
        public string dividerThickness { get; set; }
        public int gap { get; set; }
        public string alignItems { get; set; }
        public string orientation { get; set; }
        public List<KeyInformationBarItemProps> columns { get; set; }
    }
}
