using Shesha.Domain.Enums;
using Shesha.Otp;
using Shesha.Otp.Dto;
using Shouldly;
using System;
using System.Linq;
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
        public async Task Update_should_not_overwrite_verify_attempts_TestAsync()
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

            // an attempt is counted while an update (e.g. a resend) holds an older copy of the OTP
            await storage.UpdateAsync(operationId, async dto =>
            {
                await storage.IncrementVerifyAttemptsAsync(operationId);
                dto.SendStatus = OtpSendStatus.Sent;
            });

            var otp = await storage.GetAsync(operationId);
            otp.VerifyAttempts.ShouldBe(1);
            otp.SendStatus.ShouldBe(OtpSendStatus.Sent);
        }

        [Fact]
        public async Task TryConsume_should_succeed_once_TestAsync()
        {
            var storage = Resolve<DbOtpStorage>();
            var operationId = await SaveOtpAsync(storage);

            var results = await Task.WhenAll(Enumerable.Range(0, 5).Select(_ => Task.Run(() => storage.TryConsumeAsync(operationId))));

            results.Count(r => r).ShouldBe(1);
            (await storage.TryConsumeAsync(operationId)).ShouldBeFalse();
            (await storage.GetAsync(operationId)).ConsumedOn.ShouldNotBeNull();
        }

        [Fact]
        public async Task Update_should_not_restore_consumed_otp_TestAsync()
        {
            var storage = Resolve<DbOtpStorage>();
            var operationId = await SaveOtpAsync(storage);

            // the OTP is consumed while an update (e.g. a resend extending the expiry) holds an older copy of it
            await storage.UpdateAsync(operationId, async dto =>
            {
                (await storage.TryConsumeAsync(operationId)).ShouldBeTrue();
                dto.ExpiresOn = DateTime.Now.AddMinutes(10);
            });

            (await storage.GetAsync(operationId)).ConsumedOn.ShouldNotBeNull();
            (await storage.TryConsumeAsync(operationId)).ShouldBeFalse();
            (await Resolve<IOtpManager>().VerifyPinAsync(new VerifyPinInput { OperationId = operationId, Pin = "123456" })).IsSuccess.ShouldBeFalse();
        }

        [Fact]
        public async Task IncrementVerifyAttempts_should_return_distinct_counts_when_concurrent_TestAsync()
        {
            var storage = Resolve<DbOtpStorage>();
            var operationId = await SaveOtpAsync(storage);

            var results = await Task.WhenAll(Enumerable.Range(0, 10).Select(_ => Task.Run(() => storage.IncrementVerifyAttemptsAsync(operationId))));

            results.OrderBy(r => r).ShouldBe(Enumerable.Range(1, 10));
        }

        [Fact]
        public async Task TryConsume_should_fail_for_unknown_operation_TestAsync()
        {
            var storage = Resolve<DbOtpStorage>();

            (await storage.TryConsumeAsync(Guid.NewGuid())).ShouldBeFalse();
        }

        [Fact]
        public async Task VerifyPin_should_fail_after_consume_TestAsync()
        {
            var storage = Resolve<DbOtpStorage>();
            var operationId = await SaveOtpAsync(storage);
            var otpManager = Resolve<IOtpManager>();

            (await otpManager.TryConsumeAsync(operationId)).ShouldBeTrue();

            (await otpManager.VerifyPinAsync(new VerifyPinInput { OperationId = operationId, Pin = "123456" })).IsSuccess.ShouldBeFalse();
        }

        private static async Task<Guid> SaveOtpAsync(DbOtpStorage storage)
        {
            var operationId = Guid.NewGuid();
            await storage.SaveAsync(new OtpDto
            {
                OperationId = operationId,
                Pin = "123456",
                SendTo = "0820000000",
                SendType = OtpSendType.Sms,
                ExpiresOn = DateTime.Now.AddMinutes(3),
            });
            return operationId;
        }

        [Fact]
        public async Task IncrementVerifyAttempts_should_return_zero_for_unknown_operation_TestAsync()
        {
            var storage = Resolve<DbOtpStorage>();

            (await storage.IncrementVerifyAttemptsAsync(Guid.NewGuid())).ShouldBe(0);
        }
    }
}
