using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Switches off prefix for target properties
    /// </summary>
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Class)]
    public class PrefixAttribute : Attribute
    {
        public bool UsePrefixes { get; set; }
        public string Prefix { get; set; }

        public PrefixAttribute()
        {
            UsePrefixes = true;
        }
    }
}
