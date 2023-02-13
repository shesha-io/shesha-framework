using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
