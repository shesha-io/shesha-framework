using Newtonsoft.Json;
using Shesha.EntityReferences;
using System;
using System.ComponentModel;

namespace Shesha.Domain
{
    /// <summary>
    /// Form identifier
    /// </summary>
    [Serializable]
    public class FormIdentifier : ConfigurationItemIdentifier
    {
        public FormIdentifier(string module, string name) : base(module, name)
        {
        }

        [JsonIgnore]
        public override string ItemType => "form";
    }
}