using Shesha.Domain.Attributes;
using System.ComponentModel.DataAnnotations;
using System;
using Shesha.Reflection;

namespace Shesha.Domain
{
    [JoinedProperty("reference_list_revisions", Schema = "frwk")]
    [SnakeCaseNaming]
    [DiscriminatorValue(ReferenceList.ItemTypeName)]
    public class ReferenceListRevision : ConfigurationItemRevision
    {
        [MaxLength(300)]
        [Display(Name = "Namespace")]
        [Obsolete("Is used for backward compatibility only")]
        public virtual string? Namespace { get; set; }

        /// <summary>
        /// If true indicates that the application logic references
        /// the values or names of the items directly and should therefore
        /// not be changed once set.
        /// </summary>
        [Display(Name = "Has hard link to application", Description = "If true, indicates that the application logic references the values or names of the items directly and should therefore not be changed once set.")]
        public virtual bool HardLinkToApplication { get; protected set; }

        [Display(Name = "No Selection Value")]
        public virtual Int64? NoSelectionValue { get; set; }

        public virtual void SetHardLinkToApplication(bool value)
        {
            HardLinkToApplication = value;
        }

        public ReferenceListRevision()
        {
            NoSelectionValue = -999;
        }

        /// <summary>
        /// Reference List
        /// </summary>
        public virtual ReferenceList RefList => ConfigurationItem.ForceCastAs<ReferenceList>();
    }
}
