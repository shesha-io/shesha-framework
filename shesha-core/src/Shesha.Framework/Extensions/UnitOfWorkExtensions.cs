using Abp.Domain.Uow;
using Shesha.Domain;
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

        /// <summary>
        /// Get item from unit of work
        /// </summary>
        /// <typeparam name="T">Type</typeparam>
        /// <param name="uow">Unit of work</param>
        /// <param name="key">Item key</param>
        /// <returns></returns>
        public static T? GetItemOrDefault<T>(this IActiveUnitOfWork uow, string key) 
        {
            return uow.Items.TryGetValue(key, out var item) && item is T typedItem
                ? typedItem
                : default;
        }

        /// <summary>
        /// Get or add item to unit of work
        /// </summary>
        /// <typeparam name="T">Item type</typeparam>
        /// <param name="uow">Unit of work</param>
        /// <param name="key">Item key</param>
        /// <param name="factory">Factory the is used to create item when not exists</param>
        /// <returns></returns>
        public static T GetOrAdd<T>(this IActiveUnitOfWork uow, string key, Func<T> factory)
        {
            var result = GetItemOrDefault<T>(uow, key);
            if (result == null)
            {
                result = factory();
                uow.Items.Add(key, result);
            }
            return result;
        }

        /// <summary>
        /// Set item in unit of work
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="uow">Unit of work</param>
        /// <param name="key">Item key</param>
        /// <param name="value">Item value</param>
        public static void SetItem<T>(this IActiveUnitOfWork uow, string key, T value) 
        { 
            uow.Items[key] = value;
        }

        /// <summary>
        /// Add an action that should be executed after successful completion of the current transaction
        /// </summary>
        public static void DoAfterTransaction(this IActiveUnitOfWork unitOfWork, Action action) 
        { 
            if (unitOfWork is not IUnitOfWorkHasAfterTransactionHandler uow)
                throw new NotSupportedException($"Unit of work {unitOfWork.GetType().FullName} does not support {nameof(DoAfterTransaction)} method.");

            uow.AddAfterTransactionAction(action);
        }
    }
}
