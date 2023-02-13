using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Attribute for identification of many-to-many relations. 
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class OneToOneAttribute: Attribute
    {
    }
}
