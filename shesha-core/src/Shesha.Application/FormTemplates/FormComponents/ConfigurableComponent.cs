using Shesha.FormTemplates.FormComponents.Enums;
using Shesha.FormTemplates.FormComponents.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.FormTemplates.FormComponents
{
    public class ConfigurableComponent : IConfigurableFormComponent
    {
        public string type { get; set; }
        public string? description { get; set; }
        public string editMode { get; set; }
        public bool jsSetting { get; set; }
        public string id { get; set; }
        public string parentId { get; set; }
        public string? label { get; set; }
        public bool hideLabel { get; set; }
        public string labelAlign { get; set; }
        public bool hidden { get; set; }
        public string componentName { get; set; }
        public string propertyName { get; set; }
    }
}
