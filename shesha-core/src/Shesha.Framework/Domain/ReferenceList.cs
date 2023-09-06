using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Framework.ReferenceList", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    [JoinedProperty("Frwk_ReferenceLists")]
    [DiscriminatorValue(ItemTypeName)]
    public class ReferenceList : ConfigurationItemBase
    {
        public const string ItemTypeName = "reference-list";

        public ReferenceList()
        {
            NoSelectionValue = -999;
        }

        public override string ItemType => ItemTypeName;

        [StringLength(300)]
        [Display(Name = "Namespace")]
        [Obsolete("Is used for backward compatibility only")]
        public virtual string Namespace { get; set; }

        /// <summary>
        /// If true indicates that the application logic references
        /// the values or names of the items directly and should therefore
        /// not be changed once set.
        /// </summary>
        [Display(Name = "Has hard link to application", Description = "If true, indicates that the application logic references the values or names of the items directly and should therefore not be changed once set.")]
        public virtual bool HardLinkToApplication { get; protected set; }

        [Display(Name = "No Selection Value")]
        public virtual Int64? NoSelectionValue { get; set; }

        /*
        /// <summary>
        /// If true, the numbering of the reference list items should
        /// follow a binary sequence i.e. 1, 2, 4, 8, etc... This is typiclly the case where a reference
        /// list is used for a Multi-value reference list property.
        /// </summary>
        [Display(Name = "Must use bit numbering", Description = "If true, the numbering of the reference list items should follow a binary sequence i.e. 1, 2, 4, 8, etc... This is typiclly the case where a reference list is used for a Multi-value reference list property.")]
        public virtual bool MustUseBitNumbering { get; set; }         
         */

        /// <summary>
        /// Get reference list identifier
        /// </summary>
        /// <returns></returns>
        public virtual ReferenceListIdentifier GetReferenceListIdentifier()
        {
            return new ReferenceListIdentifier(Module?.Name, Name);
        }

        public virtual void SetHardLinkToApplication(bool value)
        {
            HardLinkToApplication = value;
        }
    }
}