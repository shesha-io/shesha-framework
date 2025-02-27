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
    public class FormIdentifier : ConfigurationItemIdentifier<FormConfiguration>, IIdentifierFactory<FormIdentifier>
    {
        public FormIdentifier(string module, string name) : base(module, name)
        {
        }

        public static FormIdentifier New(string module, string name)
        {
            return new FormIdentifier(module, name);
        }
    }
}