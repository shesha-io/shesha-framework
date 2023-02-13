using Abp.Specifications;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Specifications
{
    /// <summary>
    /// Provides access to a list of specifications that should be applied in current execution context. Includes both global specifications and custom ones (e.g. applied to concrete API endpoints)
    /// </summary>
    public interface ISpecificationManager
    {
        /// <summary>
        /// List of specifications in current execution context
        /// </summary>
        List<Type> SpecificationTypes { get; }

        /// <summary>
        /// Apply all specifications of the current context
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="queryable">Queryable to apply specifications</param>
        /// <returns></returns>
        IQueryable<T> ApplySpecifications<T>(IQueryable<T> queryable);

        /// <summary>
        /// Apply specifications to a specified <paramref name="queryable"/>
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="queryable">Queryable</param>
        /// <param name="specifications">List of specifications to apply</param>
        /// <returns></returns>
        IQueryable<T> ApplySpecifications<T>(IQueryable<T> queryable, List<string> specifications);

        /// <summary>
        /// Get active specification from current context
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <returns></returns>
        List<ISpecification<T>> GetSpecifications<T>();

        /// <summary>
        /// Get specification instances by names passed in the <paramref name="specifications"/>
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="specifications">Names of specifications</param>
        /// <returns></returns>
        List<ISpecification<T>> GetSpecifications<T>(List<string> specifications);

        /// <summary>
        /// Activate specifications context
        /// </summary>
        /// <typeparam name="TSpec">Type of specifications</typeparam>
        /// <typeparam name="TEntity">Type of entity</typeparam>
        /// <returns></returns>
        ISpecificationsContext Use<TSpec, TEntity>() where TSpec : ISpecification<TEntity>;

        /// <summary>
        /// Activate specifications context
        /// </summary>
        /// <param name="specificationType">Type of specifications</param>
        IDisposable Use(params Type[] specificationType);

        /// <summary>
        /// Disables all specifications activate using current specifications manager
        /// </summary>
        /// <returns></returns>
        IDisposable DisableSpecifications();

        /// <summary>
        /// Get specification instance by <see cref="ISpecificationInfo"/>
        /// </summary>
        /// <typeparam name="T">Type of entity</typeparam>
        /// <param name="specInfo">Specification info</param>
        /// <returns></returns>
        ISpecification<T> GetSpecificationInstance<T>(ISpecificationInfo specInfo);
    }
}
