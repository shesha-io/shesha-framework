using Abp.Domain.Entities.Auditing;
using Shesha.Authorization.Users;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.QuestionAssignment", CrudActions = CrudActions.None, IsConfigurable = false)]
    public class QuestionAssignment: FullAuditedEntity<Guid>
    {
        /// <summary>
        /// 
        /// </summary>
        public virtual User User { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public virtual SecurityQuestion SelectedQuestion { get; set; }

        /// <summary>
        /// 
        /// </summary>
        [MaxLength(500)]
        public virtual string Answer { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public virtual int? TenantId { get; set; }

    }
}
