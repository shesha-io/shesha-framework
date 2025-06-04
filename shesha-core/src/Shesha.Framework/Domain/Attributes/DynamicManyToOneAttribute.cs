using System;

namespace Shesha.Domain.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class DynamicManyToOneAttribute: Attribute
    {
        public string PropertyName { get; set; }

        public DynamicManyToOneAttribute(string propertyName)
        { 
            PropertyName = propertyName;
        }

    }
}
