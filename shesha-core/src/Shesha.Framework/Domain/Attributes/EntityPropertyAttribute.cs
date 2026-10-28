using System;

namespace Shesha.Domain.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class EntityPropertyAttribute : Attribute
    {
        public string Name { get; set; }

        public EntityPropertyAttribute(string name)
        {
            Name = name;
        }
    }
}
