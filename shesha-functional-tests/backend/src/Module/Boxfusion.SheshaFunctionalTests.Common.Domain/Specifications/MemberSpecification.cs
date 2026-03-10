using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain;
using Boxfusion.SheshaFunctionalTests.Common.Domain.Domain.Enum;
using Shesha.Specifications;
using System;
using System.Linq.Expressions;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Specifications
{
    /// <summary>
    /// Specification to filter members based on their membership status. Only returns members with an active membership status.
    /// </summary>
    public class MemberSpecification : ShaSpecification<Member>
    {
        public override Expression<Func<Member, bool>> BuildExpression()
        {
            return member => member.MembershipStatus == RefListMembershipStatuses.Active;
        }
    }
}
