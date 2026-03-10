using System;

namespace Shesha.Domain
{
    /// <summary>
    /// UnitOfWork than supports after transaciton handler.
    /// </summary>
    public interface IUnitOfWorkHasAfterTransactionHandler
    {
        /// <summary>
        /// Add new after transaction action
        /// </summary>
        /// <param name="action"></param>
        void AddAfterTransactionAction(Action action);
    }
}
