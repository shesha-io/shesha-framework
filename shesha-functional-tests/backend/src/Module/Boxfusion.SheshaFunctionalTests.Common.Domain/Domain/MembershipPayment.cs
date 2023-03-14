using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    /// <summary>
    ///
    /// </summary>
    [Entity(TypeShortAlias = "SheshaFunctionalTests.MembershipPayment")]
    public class MembershipPayment : FullAuditedEntity<Guid>
    {
        /// <summary>
        ///
        /// </summary>
        public virtual Member Member { get; set; }
        /// <summary>
        /// The payment amount
        /// </summary>
        public virtual double Amount { get; set; }
        /// <summary>
        /// The date when the payment was made
        /// </summary>
        public virtual DateTime PaymentDate { get; set; }
    }
}
