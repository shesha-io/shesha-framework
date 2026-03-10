using Abp.Auditing;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain.Enum;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.EntityHistory;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    // <summary>
    /// A person within the application that is a Member
    /// </summary>
    [Entity(TypeShortAlias = "SheshaFunctionalTests.Member")]
    public class Member : Person
    {
        /// <summary>
        /// Order Index property for sorting
        /// </summary>
        public virtual int OrderIndex { get; set; }
        /// <summary>
        /// The membership number for the Member
        /// </summary>
        [AuditedAsEvent(typeof(MembershipNumberEventCreator))]
        public virtual string MembershipNumber { get; set; }
        /// <summary>
        /// The Members residential address
        /// </summary>
        public virtual string ResidentialAddress { get; set; }
        /// <summary>
        /// The region that the Member belongs to
        /// </summary>
        public virtual Area Region { get; set; }
        /// <summary>
        /// The branch that the Member belongs to
        /// </summary>
        public virtual Area Branch { get; set; }
        /// <summary>
        /// The date when the Members membership started
        /// </summary>
        public virtual DateTime MembershipStartDate { get; set; }
        /// <summary>
        /// The date when the Members membership ended
        /// </summary>
        public virtual DateTime MembershipEndDate { get; set; }
        /// <summary>
        /// Identification document for the Member
        /// </summary>
        //[NotMapped]
        //public virtual StoredFile IdDocument { get; set; }
        /// <summary>
        /// The status of the membership
        /// </summary>
        [Audited]
        [ReferenceList("SheshaFunctionalTests", "MembershipStatuses")]
        public virtual RefListMembershipStatuses? MembershipStatus { get; set; }
        /// <summary>
        /// 
        /// </summary>
        [MultiValueReferenceList("SheshaFunctionalTests", "CommunicationLanguage")]
        public virtual RefListCommunicationLanguage? CommunicationLanguage { get; set; }
        /// <summary>
        /// 
        /// </summary>
        [SaveAsJson]
        public virtual ImageAnnotationStorage ImageAnnotation { get; set; }
        /// <summary>
        /// 
        /// </summary>
        [Audited]
        [ReferenceList("SheshaFunctionalTests", "Provinces")]
        public virtual RefListProvinces? Province { get; set; }
        /// <summary> 
        /// 
        /// </summary>
        [ReferenceList("SheshaFunctionalTests", "Religion")]
        public virtual RefListReligion? Religion { get; set; }
        /// <summary> 
        /// 
        /// </summary>
        [ReferenceList("SheshaFunctionalTests", "EducationLevel")]
        public virtual RefListEducationLevel? EducationLevel { get; set; }
        /// <summary> 
        /// 
        /// </summary>
        [Audited]
        [ReferenceList("SheshaFunctionalTests", "MaritalStatus")]
        public virtual RefListMaritalStatus? MaritalStatus { get; set; }
        /// <summary>
        /// The bank that the Member belongs to
        /// </summary>
        [DisplayChildAuditTrail]
        public virtual Bank Bank { get; set; }
        /// <summary> 
        /// 
        /// </summary>
        public virtual string Base64String { get; set; }
        /// <summary>
        /// This is a custom audit trail event creator for the Membership Number property
        /// </summary>
        private class MembershipNumberEventCreator : EntityHistoryEventCreatorBase<Member, string>
        {
            public override EntityHistoryEventInfo CreateEvent(EntityChangesInfo<Member, string> change)
            {
                return CreateEvent("Custom Event Description", $"Membership number updated from {change.OldValue} to {change.NewValue}");
            }
        }
    }
}
