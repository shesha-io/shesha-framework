using Abp.Domain.Uow;
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
    }
}
