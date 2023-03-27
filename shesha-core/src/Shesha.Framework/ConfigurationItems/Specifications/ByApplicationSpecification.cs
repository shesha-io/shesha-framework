using Abp.Specifications;
using Shesha.Domain;
using System;
using System.Linq.Expressions;

namespace Shesha.ConfigurationItems.Specifications
{
    /// <summary>
    /// Specification to find entities which implement the <see cref="IMayHaveFrontEndApplication"/> by the <see cref="FrontEndApp.AppKey"/>
    /// </summary>
    public class ByApplicationSpecification<TItem> : ISpecification<TItem> where TItem : IMayHaveFrontEndApplication
    {
        public string AppKey { get; private set; }

        public ByApplicationSpecification(string appKey)
        {
            AppKey = appKey;
        }

        public bool IsSatisfiedBy(TItem obj)
        {
            return string.IsNullOrWhiteSpace(AppKey)
                ? obj.Application == null
                : obj.Application?.AppKey == AppKey;
        }

        public Expression<Func<TItem, bool>> ToExpression()
        {
            return string.IsNullOrWhiteSpace(AppKey)
                ? item => item.Application == null
                : item => item.Application != null && item.Application.Name == AppKey;
        }
    }
}
