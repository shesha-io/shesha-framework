using Shesha.Domain.Enums;
using Shesha.Otp;
using Shesha.Otp.Dto;
using Shouldly;
using System;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Otp
{
    public class DbOtpStorage_Tests : SheshaNhTestBase
    {
        [Fact]
        public async Task IncrementVerifyAttempts_should_persist_counter_TestAsync()
        {
            var storage = Resolve<DbOtpStorage>();
            var operationId = Guid.NewGuid();

            await storage.SaveAsync(new OtpDto
            {
                OperationId = operationId,
                Pin = "123456",
                SendTo = "0820000000",
                SendType = OtpSendType.Sms,
                ExpiresOn = DateTime.Now.AddMinutes(3),
            });

            (await storage.IncrementVerifyAttemptsAsync(operationId)).ShouldBe(1);
            (await storage.IncrementVerifyAttemptsAsync(operationId)).ShouldBe(2);

            (await storage.GetAsync(operationId)).VerifyAttempts.ShouldBe(2);
        }

        [Fact]
        public async Task IncrementVerifyAttempts_should_return_zero_for_unknown_operation_TestAsync()
        {
            var storage = Resolve<DbOtpStorage>();

            (await storage.IncrementVerifyAttemptsAsync(Guid.NewGuid())).ShouldBe(0);
        }
    }
}
