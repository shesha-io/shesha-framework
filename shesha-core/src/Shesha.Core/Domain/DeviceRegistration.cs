using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.DeviceRegistration", CrudActions = CrudActions.None, IsConfigurable = false)]
    public class DeviceRegistration : FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Mobile User
        /// </summary>
        public virtual Person Person { get; set; }
        /// <summary>
        /// Registration Token
        /// </summary>
        [MaxLength(1000)]
        public virtual string DeviceRegistrationId { get; set; }
        /// <summary>
        /// Application ID
        /// </summary>
        [MaxLength(1000)]
        public virtual string AppId { get; set; }
    }
}
