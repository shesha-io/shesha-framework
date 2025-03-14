﻿using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    /// <summary>
    /// Full audited entity that supports synchronization with external system
    /// </summary>
    /// <typeparam name="TId">Type of the Id</typeparam>
    public abstract class FullAuditedEntityWithExternalSync<TId>: FullAuditedEntity<TId>
    {
        [StringLength(100)]
        public virtual string ExtSysId { get; set; }
        [StringLength(100)]
        public virtual string ExtSysSource { get; set; }
        public virtual RefListExternalSyncStatus? ExtSysSyncStatus { get; set; }
        public virtual DateTime? ExtSysFirstSyncDate { get; set; }
        public virtual DateTime? ExtSysLastSyncDate { get; set; }
        [StringLength(int.MaxValue)]
        public virtual string ExtSysSyncError { get; set; }
    }
}
