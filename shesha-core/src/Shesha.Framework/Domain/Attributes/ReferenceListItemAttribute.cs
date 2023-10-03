using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Attribute used to decorate any domain object property whose values
    /// should be restricted to the values of a Reference List.
    /// </summary>
    [AttributeUsage(AttributeTargets.Field, AllowMultiple = false, Inherited = true)]
    public class ReferenceListItemAttribute : Attribute
    {
        public ReferenceListItemAttribute(string color)
        {
            Color = color;
        }

        public string Color { get; set; }
    }
}
