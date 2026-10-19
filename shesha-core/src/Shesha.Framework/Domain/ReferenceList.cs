using Abp.Domain.Entities;
using Shesha.Authorization;
using Shesha.Domain.Attributes;
using Shesha.Domain.Constants;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    [Entity(
        FriendlyName = "List of Values", 
        TypeShortAlias = "Shesha.Framework.ReferenceList",
        CrudActions = CrudActions.All,
        IsConfigurable = false,
        CrudActionsAccess = CrudActionsAccess.AllowAnonymous
    )]
    [EntityAuthorize(CrudAction.Create, [PermissionNames.Application_Configure, PermissionNames.Application_Administer])]
    [EntityAuthorize(CrudAction.Update, [PermissionNames.Application_Configure, PermissionNames.Application_Administer])]
    [EntityAuthorize(CrudAction.Delete, [PermissionNames.Application_Configure, PermissionNames.Application_Administer])]
    [FixedView(ConfigurationItemsViews.Create, SheshaFrameworkModule.ModuleName, "cs-reflist-create")]
    [JoinedProperty("reference_lists", Schema = "frwk")]
    [DiscriminatorValue(ItemTypeName)]
    [SnakeCaseNaming]
    [Exposable(ItemTypeName)]
    public class ReferenceList : ConfigurationItem
    {
        public const string ItemTypeName = "reference-list";

        public ReferenceList()
        {
        }

        public override string ItemType => ItemTypeName;

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

        [MaxLength(300)]
        [Display(Name = "Namespace")]
        [Obsolete("Is used for backward compatibility only")]
        public virtual string? Namespace { get; set; }

        /// <summary>
        /// Get reference list identifier
        /// </summary>
        /// <returns></returns>
        public virtual ReferenceListIdentifier GetReferenceListIdentifier()
        {
            return new ReferenceListIdentifier(Module?.Name, Name);
        }
    }
}