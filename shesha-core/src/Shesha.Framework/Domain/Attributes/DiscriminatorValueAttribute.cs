using System;

namespace Shesha.Domain.Attributes
{
    [AttributeUsage(AttributeTargets.Class)]
    public class DiscriminatorValueAttribute : Attribute
    {
        public object Value { get; set; }

        public DiscriminatorValueAttribute(object value)
        {
            Value = value;
        }
    }
}
