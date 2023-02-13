using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Attribute used to decorate any domain object property whose values
    /// should be restricted to the values of a Reference List.
    /// </summary>
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property | AttributeTargets.Enum, AllowMultiple = false, Inherited = true)]
    public class ReferenceListAttribute : ReferenceListAttributeBase
    {
        public ReferenceListAttribute(string @namespace, string name) : base(@namespace, name)
        {
        }

        public ReferenceListAttribute(string name) : base(name)
        {
        }

        public bool OrderByName { get; set; }
    }
}
