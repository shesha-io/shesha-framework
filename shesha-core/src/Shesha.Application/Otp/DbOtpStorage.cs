using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using NHibernate;
using Shesha.Domain;
using Shesha.Otp.Dto;
using System;
using System.Threading.Tasks;
using System.Transactions;

namespace Shesha.Otp
{
    /// <summary>
    /// Database storage for one-time-pins
    /// </summary>
    public class DbOtpStorage : IOtpStorage, ITransientDependency
    {
        private readonly IRepository<OtpAuditItem, Guid> _otpAuditRepository;
        private readonly IUnitOfWorkManager _uowManager;
        private readonly ISessionFactory _sessionFactory;

        /// <summary>
        /// default constructor
        /// </summary>
        public DbOtpStorage(IRepository<OtpAuditItem, Guid> otpAuditRepository, IUnitOfWorkManager uowManager, ISessionFactory sessionFactory)
        {
            _otpAuditRepository = otpAuditRepository;
            _uowManager = uowManager;
            _sessionFactory = sessionFactory;
        }

        /// inheritedDoc
        public async Task<int> IncrementVerifyAttemptsAsync(Guid operationId)
        {
            // A dedicated session executes a single atomic `update` outside the caller's transaction, so concurrent
            // verification requests can't read the same counter value, and a rollback of the caller's unit of work
            // doesn't undo the attempt
            var entityName = typeof(OtpAuditItem).FullName;
            using (var session = _sessionFactory.OpenSession())
            {
                await session.CreateQuery($"update {entityName} set VerifyAttempts = VerifyAttempts + 1 where Id = :id")
                    .SetParameter("id", operationId)
                    .ExecuteUpdateAsync();

                var attempts = await session.CreateQuery($"select i.VerifyAttempts from {entityName} i where i.Id = :id")
                    .SetParameter("id", operationId)
                    .UniqueResultAsync<int?>();

                return attempts ?? 0;
            }
        }

        /// inheritedDoc
        public async Task<bool> TryConsumeAsync(Guid operationId)
        {
            // A single conditional `update` in a dedicated session: the database lets only one concurrent call change
            // the row, on any instance, and the change is committed even if the caller's unit of work rolls back.
            // Expiring the OTP makes it fail verification from now on. It's set clearly in the past, so that a concurrent
            // call can't still see it as valid because of datetime rounding
            var entityName = typeof(OtpAuditItem).FullName;
            var now = DateTime.Now;
            using (var session = _sessionFactory.OpenSession())
            {
                var updated = await session.CreateQuery($"update {entityName} set ExpiresOn = :consumedExpiry where Id = :id and (ExpiresOn is null or ExpiresOn > :now)")
                    .SetParameter("id", operationId)
                    .SetParameter("now", now)
                    .SetParameter("consumedExpiry", now.AddMinutes(-1))
                    .ExecuteUpdateAsync();

                return updated == 1;
            }
        }

        /// <summary>
        /// Save OTP to the DB
        /// </summary>
        public async Task SaveAsync(OtpDto input)
        {
            await SaveOrUpdateAsync(input, true);
        }

        private async Task SaveOrUpdateAsync(OtpDto input, bool isNew)
        {
            using (var uow = _uowManager.Begin(TransactionScopeOption.RequiresNew))
            {
                var item = new OtpAuditItem
                {
                    Id = input.OperationId,
                    Otp = input.Pin,
                    ExpiresOn = input.ExpiresOn,
                    ActionType = input.ActionType,
                    SendType = input.SendType,
                    SendTo = input.SendTo,
                    RecipientId = input.RecipientId,
                    RecipientType = input.RecipientType,
                    SentOn = input.SentOn,
                    SendStatus = input.SendStatus,
                    ErrorMessage = input.ErrorMessage,
                    VerifyAttempts = input.VerifyAttempts,
                };
                if (isNew) // note we generate Id manually
                    await _otpAuditRepository.InsertAsync(item);
                else
                    await _otpAuditRepository.UpdateAsync(item);

                await uow.CompleteAsync();
            }
        }

        /// inheritedDoc
        public async Task UpdateAsync(Guid operationId, Func<OtpDto, Task> updateAction)
        {
            var dto = await GetAsync(operationId);
            await updateAction.Invoke(dto);
            await SaveOrUpdateAsync(dto, false);
        }

        /// <summary>
        /// Get OTP from the DB
        /// </summary>
        /// <param name="operationId"></param>
        /// <returns></returns>
        public async Task<OtpDto> GetAsync(Guid operationId)
        {
            using (var uow = _uowManager.Begin(TransactionScopeOption.Suppress))
            {
                var item = await _otpAuditRepository.FirstOrDefaultAsync(i => i.Id == operationId);
                if (item == null)
                    return null;
                return new OtpDto
                {
                    OperationId = item.Id,
                    Pin = item.Otp,

                    ExpiresOn = item.ExpiresOn,
                    ActionType = item.ActionType,
                    SendType = item.SendType,
                    SendTo = item.SendTo,
                    RecipientId = item.RecipientId,
                    RecipientType = item.RecipientType,
                    SentOn = item.SentOn,
                    SendStatus = item.SendStatus,
                    ErrorMessage = item.ErrorMessage,
                    VerifyAttempts = item.VerifyAttempts,
                };
            }
        }
    }
}
