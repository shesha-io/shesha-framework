using Abp.Dependency;
using NHibernate;
using NHibernate.Linq;
using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;

namespace Shesha.Otp
{
    /// <summary>
    /// History of OTP sends per destination, used by <see cref="IOtpSendThrottle"/>
    /// </summary>
    public interface IOtpSendLog
    {
        /// <summary>
        /// Returns the sends to the destination since the specified time
        /// </summary>
        Task<List<OtpSendRecord>> GetSendsAsync(string destination, DateTime sinceUtc);

        /// <summary>
        /// Records a send to the destination, and removes sends (to any destination) from before <paramref name="deleteBeforeUtc"/>
        /// </summary>
        /// <returns>Id of the new record</returns>
        Task<Guid> AddAsync(string destination, DateTime sentOnUtc, DateTime deleteBeforeUtc);

        /// <summary>
        /// Removes a send that was recorded but not allowed
        /// </summary>
        Task RemoveAsync(Guid id);
    }

    /// <summary>
    /// A send recorded in <see cref="IOtpSendLog"/>
    /// </summary>
    /// <param name="Id">Id of the record</param>
    /// <param name="SentOnUtc">When the pin was sent (UTC)</param>
    public record OtpSendRecord(Guid Id, DateTime SentOnUtc);

    /// <summary>
    /// Database history of OTP sends, shared by all instances of the application
    /// </summary>
    public class DbOtpSendLog : IOtpSendLog, ITransientDependency
    {
        private readonly ISessionFactory _sessionFactory;

        /// <summary>
        /// Default constructor
        /// </summary>
        public DbOtpSendLog(ISessionFactory sessionFactory)
        {
            _sessionFactory = sessionFactory;
        }

        // Both methods use their own session and transaction, outside the caller's unit of work: a send is counted even if
        // the caller rolls back (e.g. when the pin can't be delivered), and the log's locks are never held by the caller's
        // transaction while another transaction waits for them

        /// <inheritdoc/>
        public async Task<List<OtpSendRecord>> GetSendsAsync(string destination, DateTime sinceUtc)
        {
            using (new TransactionScope(TransactionScopeOption.Suppress, TransactionScopeAsyncFlowOption.Enabled))
            using (var session = _sessionFactory.OpenSession())
            {
                var items = await session.Query<OtpSendLogItem>()
                    .Where(i => i.Destination == destination && i.SentOnUtc > sinceUtc)
                    .Select(i => new { i.Id, i.SentOnUtc })
                    .ToListAsync();
                return items.Select(i => new OtpSendRecord(i.Id, i.SentOnUtc)).ToList();
            }
        }

        /// <inheritdoc/>
        public async Task<Guid> AddAsync(string destination, DateTime sentOnUtc, DateTime deleteBeforeUtc)
        {
            using (new TransactionScope(TransactionScopeOption.Suppress, TransactionScopeAsyncFlowOption.Enabled))
            using (var session = _sessionFactory.OpenSession())
            using (var transaction = session.BeginTransaction())
            {
                var id = Guid.NewGuid();
                await session.SaveAsync(new OtpSendLogItem { Id = id, Destination = destination, SentOnUtc = sentOnUtc });
                await session.FlushAsync();

                await session.Query<OtpSendLogItem>()
                    .Where(i => i.SentOnUtc < deleteBeforeUtc)
                    .DeleteAsync();

                await transaction.CommitAsync();
                return id;
            }
        }

        /// <inheritdoc/>
        public async Task RemoveAsync(Guid id)
        {
            using (new TransactionScope(TransactionScopeOption.Suppress, TransactionScopeAsyncFlowOption.Enabled))
            using (var session = _sessionFactory.OpenSession())
            {
                await session.Query<OtpSendLogItem>()
                    .Where(i => i.Id == id)
                    .DeleteAsync();
            }
        }
    }
}
