using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.UI;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using NHibernate.Linq;
using Shesha.Configuration.StressTesting;
using Shesha.Domain;
using Shesha.Otp.Dto;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.StressTesting
{
    public class StressTestingAppService:SheshaAppServiceBase
    {

        private readonly IRepository<OtpAuditItem, Guid> _otpAuditRepository;
        private readonly IUnitOfWorkManager _uowManager;
        private readonly IStressTestingSettings _stressTestingSettings;
        private readonly IWebHostEnvironment _webHostEnvironment;


        public StressTestingAppService(IRepository<OtpAuditItem, Guid> otpAuditRepository, IUnitOfWorkManager uowManager, IStressTestingSettings stressTestingSettings, IWebHostEnvironment webHostEnvironment)
        {
            _otpAuditRepository = otpAuditRepository;
            _uowManager = uowManager;
            _stressTestingSettings = stressTestingSettings;
            _webHostEnvironment = webHostEnvironment;
        }

        /// <summary>
        /// Getting OTP Sent using phoneNumber or email address for stress testing 
        /// </summary>
        /// <param name="emailAddressOrPhoneNumber"></param>
        /// <returns></returns>
        public async Task<IOtpDto> GetOtpByEmailAddressOrPhoneNumberAsync(string emailAddressOrPhoneNumber)
        {
            if (string.IsNullOrWhiteSpace(emailAddressOrPhoneNumber))
                throw new Exception($"Email/PhoneNumber must be specified");

            return await GetOtpInfoAsync(emailAddressOrPhoneNumber);
        }

        private async Task<IOtpDto> GetOtpInfoAsync(string input)
        {
            var stressTesting = await _stressTestingSettings.StressTestingSettings.GetValueAsync();
            // Check if stress testing is enabled and the environment is Development or Staging
            if (!stressTesting.EnableStressTesting && (_webHostEnvironment.IsDevelopment() || _webHostEnvironment.IsStaging()))
            {
                throw new UserFriendlyException("Stress Testing is disabled.");
            }

            //Order by descending to ensure it returns the latest record.
            var item = await _otpAuditRepository.GetAll().Where(i => i.SendTo == input).OrderByDescending(i => i.CreationTime).FirstOrDefaultAsync();
            if (item == null)
            {
                throw new UserFriendlyException($"No record found for {input}");
            }
          
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
