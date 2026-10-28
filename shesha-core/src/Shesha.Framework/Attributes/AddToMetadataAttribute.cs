using System;

namespace Shesha.Attributes
{
    /// <summary>
    /// This attribute is used to mark class as available for using in configurations (Forms, etc)
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class AddToMetadataAttribute: Attribute
    {
        public AddToMetadataAttribute() 
        { 
        }
    }
}
