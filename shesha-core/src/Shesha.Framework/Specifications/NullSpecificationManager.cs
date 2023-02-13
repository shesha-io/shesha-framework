using Abp.Specifications;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.Specifications
{
    /// <summary>
    /// Null implementation of the <see cref="ISpecificationManager"/>
    /// </summary>
    public class NullSpecificationManager : ISpecificationManager
    {
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
            return null;
        }

        public ISpecification<T> GetSpecificationInstance<T>(ISpecificationInfo specInfo)
        {
            return null;
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
            return null;
        }

        public IDisposable Use(params Type[] specificationType)
        {
            return null;
        }
    }
}
