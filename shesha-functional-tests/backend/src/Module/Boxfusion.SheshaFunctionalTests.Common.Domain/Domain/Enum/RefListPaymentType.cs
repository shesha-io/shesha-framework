using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain.Enum
{
    /// <summary>
    /// 
    /// </summary>
    [ReferenceList("SheshaFunctionalTests", "PaymentType")]
    public enum RefListPaymentType : long
    {
        /// <summary>
        /// 
        /// </summary>
        Cash = 1,
        /// <summary>
        ///             
        /// </summary>
        CreditCard = 2,
        /// <summary>
        ///     
        /// </summary>
        DebitCard = 3,
        /// <summary>
        ///               
        /// </summary>
        EFT = 4
    }
}
