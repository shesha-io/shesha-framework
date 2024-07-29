using Abp.Specifications;
using Shesha.Domain;
using System;
using System.Linq.Expressions;

namespace Shesha.ConfigurationItems.Specifications
{
    /// <summary>
    /// Specification to find configuration item by userId
    /// </summary>
    public class ByUserSpecification<TItem> : ISpecification<TItem> where TItem : IMayHaveFrontEndApplication
    {
        public long? UserId { get; private set; }

        public ByUserSpecification(long? userId)
        {
            UserId = userId;
        }

        public bool IsSatisfiedBy(TItem obj)
        {
            return UserId == null
                ? obj.User == null
                : obj.User?.Id == UserId;
        }

        public Expression<Func<TItem, bool>> ToExpression()
        {
            return UserId == null ? item => item.User == null : item => item.User.Id == UserId;
        }
    }
}
