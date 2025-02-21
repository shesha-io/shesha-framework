using System;

namespace Shesha.Domain
{
    /// <summary>
    /// Form identifier
    /// </summary>
    [Serializable]
    public class FormIdentifier : ConfigurationItemIdentifier<FormConfiguration>
    {
        public FormIdentifier(string module, string name) : base(module, name)
        {
        }
    }
}