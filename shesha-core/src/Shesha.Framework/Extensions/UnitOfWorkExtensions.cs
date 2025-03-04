using Abp.Domain.Uow;
using Shesha.Exceptions;
using System;
using System.Threading.Tasks;
using System.Transactions;

namespace Shesha.Extensions
{
    /// <summary>
    /// Unit of work extensions
    /// </summary>
    public static class UnitOfWorkExtensions
    {
        /// <summary>
        /// Perform action in a new unit of work
        /// </summary>
        /// <typeparam name="TResult"></typeparam>
        /// <param name="manager"></param>
        /// <param name="action"></param>
        /// <param name="scope"></param>
        /// <returns></returns>
        public static async Task<TResult> WithUnitOfWorkAsync<TResult>(this IUnitOfWorkManager manager, Func<Task<TResult>> action, TransactionScopeOption scope)
        {
            using (var uow = manager.Begin(scope))
            {
                var result = await action.Invoke();
                await uow.CompleteAsync();
                return result;
            }
        }

        /// <summary>
        /// Get current unit of work. Throws exception if unit of work is unavailable
        /// </summary>
        /// <param name="manager"></param>
        /// <returns></returns>
        /// <exception cref="UnitOfWorkUnavailableException"></exception>
        public static IActiveUnitOfWork GetCurrent(this IUnitOfWorkManager manager) 
        {
            return manager.Current ?? throw new UnitOfWorkUnavailableException();
        }

        /// <summary>
        /// Get current unit of work or null if unavailable
        /// </summary>
        /// <param name="manager"></param>
        /// <returns></returns>
        public static IActiveUnitOfWork? GetCurrentOrNull(this IUnitOfWorkManager manager) 
        {
            return manager.Current;
        }
    }
}
