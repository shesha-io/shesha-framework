using System;
using System.Threading.Tasks;
using System.Transactions;
using Abp.Dependency;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using NHibernate.Linq;
using Shesha.Domain;
using Shesha.Otp.Dto;

namespace Shesha.Otp
{
    /// <summary>
    /// Database storage for one-time-pins
    /// </summary>
    public class DbOtpStorage : IOtpStorage, ITransientDependency
    {
        private readonly IRepository<OtpAuditItem, Guid> _otpAuditRepository;
        private readonly IUnitOfWorkManager _uowManager;

        /// <summary>
        /// default constructor
        /// </summary>
        public DbOtpStorage(IRepository<OtpAuditItem, Guid> otpAuditRepository, IUnitOfWorkManager uowManager)
        {
            _otpAuditRepository = otpAuditRepository;
            _uowManager = uowManager;
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
                    ErrorMessage = input.ErrorMessage
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
                var item = await _otpAuditRepository.GetAll().FirstOrDefaultAsync(i => i.Id == operationId);
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
                    ErrorMessage = item.ErrorMessage
                };
            }
        }
    }
}
