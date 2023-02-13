using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    /// <summary>
    /// Defines a list of user groups (Person/ShaRole/DistributionList/...) that can see the original entity.
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Framework.EntityVisibility", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService), Table("Frwk_EntityVisibility")]
    public class EntityVisibility : FullPowerManyToManyLinkEntity
    {
        /// <summary>
        /// Access rights for GrantedToEntityId on EntityId
        /// </summary>
        [MultiValueReferenceList("Shesha.Framework", "EntityAccess")]
        public virtual RefListEntityAccess EntityAccess { get; set; }
    }
}
