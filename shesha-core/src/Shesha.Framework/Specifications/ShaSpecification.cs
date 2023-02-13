using Abp.Dependency;
using Abp.Runtime.Session;
using Abp.Specifications;
using System;
using System.Linq.Expressions;

namespace Shesha.Specifications
{
    /// <summary>
    /// Represents the base class for Shesha specifications.
    /// </summary>
    /// <typeparam name="T">The type of the object to which the specification is applied.</typeparam>
    public abstract class ShaSpecification<T> : ISpecification<T>, ITransientDependency
    {
        public IAbpSession AbpSession { get; set; }
        public IIocManager IocManager { get; set; }
        public ISpecificationManager SpecificationManager { get; set; }

        /// <summary>
        /// Returns a <see cref="bool"/> value which indicates whether the specification
        /// is satisfied by the given object.
        /// </summary>
        /// <param name="obj">The object to which the specification is applied.</param>
        /// <returns>True if the specification is satisfied, otherwise false.</returns>
        public virtual bool IsSatisfiedBy(T obj)
        {
            return ToExpression().Compile()(obj);
        }

        public Expression<Func<T, bool>> ToExpression() 
        {
            // switch off other specs before expression building
            using (SpecificationManager.DisableSpecifications()) 
            {
                return BuildExpression();
            }
        }

        /// <summary>
        /// Gets the LINQ expression which represents the current specification.
        /// </summary>
        /// <returns>The LINQ expression.</returns>
        public abstract Expression<Func<T, bool>> BuildExpression();

        /// <summary>
        /// Implicitly converts a specification to expression.
        /// </summary>
        /// <param name="specification"></param>
        public static implicit operator Expression<Func<T, bool>>(ShaSpecification<T> specification)
        {
            return specification.ToExpression();
        }
    }
}
