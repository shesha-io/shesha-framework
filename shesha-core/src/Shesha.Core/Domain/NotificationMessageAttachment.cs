using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    [Entity(CrudActions = CrudActions.Read, IsConfigurable = false)]
    public class NotificationMessageAttachment : FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Name of the file, is used for overriding of the File's name
        /// </summary>
        [MaxLength(300)]
        public virtual string FileName { get; set; }
        
        /// <summary>
        /// Stored file
        /// </summary>
        public virtual StoredFile File { get; set; }

        /// <summary>
        /// Stored file
        /// </summary>
        public virtual NotificationMessage Message { get; set; }
    }
}
