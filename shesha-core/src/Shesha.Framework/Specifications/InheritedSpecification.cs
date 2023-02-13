using Abp.Specifications;
using Shesha.JsonLogic;
using System;
using System.Linq;
using System.Linq.Expressions;

namespace Shesha.Specifications
{
    /// <summary>
    /// Inherited specification. Is used as a wrapper for specifications implemented for a base class
    /// </summary>
    /// <typeparam name="TBase">Base class</typeparam>
    /// <typeparam name="TReal">Inherited class</typeparam>
    public class InheritedSpecification<TBase, TReal> : ISpecification<TReal> where TReal : TBase, new()
    {
        private readonly ISpecification<TBase> _baseSpecs;

        public InheritedSpecification(ISpecification<TBase> baseSpecs)
        {
            _baseSpecs = baseSpecs;
        }

        public bool IsSatisfiedBy(TReal obj)
        {
            return _baseSpecs.IsSatisfiedBy(obj);
        }

        public Expression<Func<TReal, bool>> ToExpression()
        {
            var baseExpression = _baseSpecs.ToExpression();

            // get parameter from the base expression (of type TBase)
            var parameter = baseExpression.Parameters.FirstOrDefault();
            if (!(parameter is ParameterExpression parameterExpression))
                throw new NotSupportedException($"Parameter of type `{parameter.GetType().FullName}` is not supported, expected: `{nameof(ParameterExpression)}`");

            // create new parameter of type TReal
            var newParameter = Expression.Parameter(typeof(TReal), parameterExpression.Name);

            var updatedBody = baseExpression.Body.ReplaceParameter(baseExpression.Parameters.Single(), newParameter);

            // construct new expression using base body and new parameter
            var query = Expression.Lambda<Func<TReal, bool>>(updatedBody, newParameter);
            return query;
        }
    }
}
