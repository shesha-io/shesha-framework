using System;

namespace Shesha.Attributes
{
    /// <summary>
    /// Alias of the class/property. Can be used as an identifier of type or property
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Interface | AttributeTargets.Property)]
    public class AliasAttribute: Attribute
    {
        /// <summary>
        /// Alias value
        /// </summary>
        public string Alias { get; set; }

        public AliasAttribute(string alias)
        {
            Alias = alias;
        }
    }
}
