using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Attribute for identifying entity properties which are supposed to be saved as JSON strings in the db.
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class SaveAsJsonAttribute: Attribute
    {
    }
}
