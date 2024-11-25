using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities.Auditing;

namespace Shesha.Domain
{
    public class OmoNotificationMessageAttachment : FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Name of the file, is used for overriding of the File's name
        /// </summary>
        [StringLength(300)]
        public virtual string FileName { get; set; }
        
        /// <summary>
        /// Stored file
        /// </summary>
        public virtual StoredFile File { get; set; }

        /// <summary>
        /// Stored file
        /// </summary>
        public virtual OmoNotificationMessage PartOf { get; set; }
    }
}
