using System;

namespace Shesha.Domain.Attributes
{
    /// <summary>
    /// Instruct persistence layer to use `Table Per Class Hierarchy` (TPH) mapping strategy
    /// Entity is mapped as a subclass with discriminator
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class DiscriminatorAttribute : Attribute
    {
        /// <summary>
        /// Name of the discriminator column
        /// </summary>
        public string DiscriminatorColumn { get; set; }
        
        /// <summary>
        /// If true, indicates that entity uses discriminator
        /// </summary>
        public bool UseDiscriminator { get; set; }
        
        /// <summary>
        /// If true, indicates that the ORM should filter out rows with unknown discriminator values
        /// </summary>
        public bool FilterUnknownDiscriminators { get; set; }

        public DiscriminatorAttribute()
        {
            DiscriminatorColumn = "Frwk_Discriminator";
            UseDiscriminator = true;
            FilterUnknownDiscriminators = true;
        }
    }
}
