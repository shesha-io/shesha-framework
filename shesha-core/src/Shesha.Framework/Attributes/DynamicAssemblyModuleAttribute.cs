using Shesha.Modules;
using System;

namespace Shesha.Attributes
{
    public class DynamicAssemblyModuleAttribute : Attribute
    {
        public SheshaModuleInfo ModuleInfo { get; set; }
        public DynamicAssemblyModuleAttribute(
            string name, // Module name
            string alias, // Alias, is used as an identifier on the front-end. By default camelCased <see cref="Name"/> is used as an identifier
            string friendlyName, // Friendly name
            string description, // Description
            string publisher, // Publisher name
            bool isEditable // Is editable
        ) 
        {
            ModuleInfo = new SheshaModuleInfo(name)
            {
                Alias = alias,
                FriendlyName = friendlyName,
                Description = description,
                Publisher = publisher,
                IsEditable = isEditable,
            };
        }
    }
}
