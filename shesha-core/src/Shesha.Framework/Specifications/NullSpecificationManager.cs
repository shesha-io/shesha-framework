using Abp;
using Abp.Specifications;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Shesha.Specifications
{
    /// <summary>
    /// Null implementation of the <see cref="ISpecificationManager"/>
    /// </summary>
    public class NullSpecificationManager : ISpecificationManager
    {
        public static readonly ISpecificationManager Instance = new NullSpecificationManager();

        public List<Type> SpecificationTypes => throw new NotImplementedException();

        public IQueryable<T> ApplySpecifications<T>(IQueryable<T> queryable)
        {
            return queryable;
        }

        public IQueryable<T> ApplySpecifications<T>(IQueryable<T> queryable, List<string> specifications)
        {
            return queryable;
        }

        public IDisposable DisableSpecifications()
        {
            return new DisposeAction(() => { });
        }

        public ISpecification<T> GetSpecificationInstance<T>(ISpecificationInfo specInfo)
        {
            return new NullSpecification<T>();
        }

        public List<ISpecification<T>> GetSpecifications<T>()
        {
            return new List<ISpecification<T>>();
        }

        public List<ISpecification<T>> GetSpecifications<T>(List<string> specifications)
        {
            return new List<ISpecification<T>>();
        }

        public ISpecificationsContext Use<TSpec, TEntity>() where TSpec : ISpecification<TEntity>
        {
            return new SpecificationsContext(typeof(TSpec), typeof(TEntity));
        }

        public IDisposable Use(params Type[] specificationType)
        {
            return new DisposeAction(() => { });
        }

        public class NullSpecification<T> : ISpecification<T>
        {
            public bool IsSatisfiedBy(T obj)
            {
                return true;
            }

            public Expression<Func<T, bool>> ToExpression()
            {
                return (e) => true;
            }
        }
    }
}
