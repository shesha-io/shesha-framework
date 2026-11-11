using Abp.Net.Mail;
using Abp.Runtime.Caching;
using Abp.UI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Moq;
using Shesha.Authorization;
using Shesha.Configuration.Security;
using Shesha.Domain.Enums;
using Shesha.Locks;
using Shesha.Otp;
using Shesha.Otp.Configuration;
using Shesha.Otp.Dto;
using Shesha.Settings;
using Shesha.Sms;
using Shesha.Users;
using Shouldly;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Otp
{
    /// <summary>
    /// Brute-force and flooding protection of the OTP flows. These tests don't need a database
    /// </summary>
    public class OtpRateLimiting_Tests
    {
        private const string Pin = "123456";

        #region Verification attempts

        [Fact]
        public async Task VerifyPin_should_reject_correct_pin_once_max_attempts_reachedAsync()
        {
            var (manager, _, operationId) = CreateManagerWithOtp(OtpSendType.Sms, maxVerifyAttempts: 3);

            for (var i = 0; i < 3; i++)
                (await manager.VerifyPinAsync(new VerifyPinInput { OperationId = operationId, Pin = "000000" })).IsSuccess.ShouldBeFalse();

            var response = await manager.VerifyPinAsync(new VerifyPinInput { OperationId = operationId, Pin = Pin });

            response.IsSuccess.ShouldBeFalse("a correct pin must be rejected once the attempt limit is reached");
            response.ErrorMessage.ShouldContain("Too many");
        }

        [Fact]
        public async Task VerifyPin_should_accept_correct_pin_within_attempt_limitAsync()
        {
            var (manager, _, operationId) = CreateManagerWithOtp(OtpSendType.Sms, maxVerifyAttempts: 3);

            for (var i = 0; i < 2; i++)
                (await manager.VerifyPinAsync(new VerifyPinInput { OperationId = operationId, Pin = "000000" })).IsSuccess.ShouldBeFalse();

            (await manager.VerifyPinAsync(new VerifyPinInput { OperationId = operationId, Pin = Pin })).IsSuccess.ShouldBeTrue();
        }

        [Fact]
        public async Task VerifyPin_should_use_default_limit_when_setting_not_configuredAsync()
        {
            var (manager, storage, operationId) = CreateManagerWithOtp(OtpSendType.Sms, maxVerifyAttempts: 0);

            for (var i = 0; i < OtpDefaults.DefaultMaxVerifyAttempts; i++)
                await manager.VerifyPinAsync(new VerifyPinInput { OperationId = operationId, Pin = "000000" });

            (await manager.VerifyPinAsync(new VerifyPinInput { OperationId = operationId, Pin = Pin })).IsSuccess.ShouldBeFalse();
            storage[operationId].VerifyAttempts.ShouldBe(OtpDefaults.DefaultMaxVerifyAttempts + 1);
        }

        [Fact]
        public async Task VerifyPin_should_not_limit_email_linksAsync()
        {
            var (manager, storage, operationId) = CreateManagerWithOtp(OtpSendType.EmailLink, maxVerifyAttempts: 1);

            for (var i = 0; i < 3; i++)
                await manager.VerifyPinAsync(new VerifyPinInput { OperationId = operationId, Pin = "wrong" });

            (await manager.VerifyPinAsync(new VerifyPinInput { OperationId = operationId, Pin = Pin })).IsSuccess.ShouldBeTrue();
            storage[operationId].VerifyAttempts.ShouldBe(0);
        }

        [Fact]
        public async Task ResendPin_should_be_rejected_once_max_attempts_reachedAsync()
        {
            var (manager, _, operationId) = CreateManagerWithOtp(OtpSendType.Sms, maxVerifyAttempts: 2);

            for (var i = 0; i < 2; i++)
                await manager.VerifyPinAsync(new VerifyPinInput { OperationId = operationId, Pin = "000000" });

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => manager.ResendPinAsync(new ResendPinInput { OperationId = operationId }));
            ex.Message.ShouldContain("Too many");
        }

        [Fact]
        public async Task ResendPin_should_be_allowed_within_attempt_limitAsync()
        {
            var (manager, _, operationId) = CreateManagerWithOtp(OtpSendType.Sms, maxVerifyAttempts: 2);

            await manager.VerifyPinAsync(new VerifyPinInput { OperationId = operationId, Pin = "000000" });

            (await manager.ResendPinAsync(new ResendPinInput { OperationId = operationId })).OperationId.ShouldBe(operationId);
        }

        [Fact]
        public async Task CacheOtpStorage_should_count_concurrent_attempts_exactlyAsync()
        {
            var operationId = Guid.NewGuid();
            var storage = CreateCacheOtpStorage(new OtpDto { OperationId = operationId, Pin = Pin, ExpiresOn = DateTime.Now.AddMinutes(5) });

            var results = await Task.WhenAll(Enumerable.Range(0, 20).Select(_ => Task.Run(() => storage.IncrementVerifyAttemptsAsync(operationId))));

            results.OrderBy(r => r).ShouldBe(Enumerable.Range(1, 20));
            (await storage.GetAsync(operationId)).VerifyAttempts.ShouldBe(20);
        }

        [Fact]
        public async Task CacheOtpStorage_update_should_keep_attempts_counted_concurrentlyAsync()
        {
            var operationId = Guid.NewGuid();
            var storage = CreateCacheOtpStorage(new OtpDto { OperationId = operationId, Pin = Pin, ExpiresOn = DateTime.Now.AddMinutes(5) });

            var updates = Enumerable.Range(0, 5).Select(_ => Task.Run(() => storage.UpdateAsync(operationId, dto =>
            {
                dto.SendStatus = OtpSendStatus.Sent;
                return Task.CompletedTask;
            })));
            var increments = Enumerable.Range(0, 10).Select(_ => Task.Run(() => storage.IncrementVerifyAttemptsAsync(operationId)));
            await Task.WhenAll(updates.Concat(increments));

            (await storage.GetAsync(operationId)).VerifyAttempts.ShouldBe(10);
        }

        [Fact]
        public async Task VerifyPin_should_fail_for_unknown_operationAsync()
        {
            var (manager, _, _) = CreateManagerWithOtp(OtpSendType.Sms, maxVerifyAttempts: 3);

            var response = await manager.VerifyPinAsync(new VerifyPinInput { OperationId = Guid.NewGuid(), Pin = Pin });

            response.IsSuccess.ShouldBeFalse();
        }

        #endregion

        #region Send throttling

        [Fact]
        public async Task Throttle_should_enforce_cooldown_per_destinationAsync()
        {
            var throttle = CreateThrottle(cooldownSeconds: 60, maxSendsPerHour: 10);

            await throttle.CheckAndRegisterSendAsync("0821234567", OtpSendType.Sms);

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => throttle.CheckAndRegisterSendAsync("0821234567", OtpSendType.Sms));
            ex.Message.ShouldContain("Please wait");

            // other destinations are not affected
            await throttle.CheckAndRegisterSendAsync("0827654321", OtpSendType.Sms);
        }

        [Fact]
        public async Task Throttle_should_enforce_hourly_cap_per_destinationAsync()
        {
            var throttle = CreateThrottle(cooldownSeconds: 0, maxSendsPerHour: 3);

            for (var i = 0; i < 3; i++)
                await throttle.CheckAndRegisterSendAsync("user@example.com", OtpSendType.Email);

            var ex = await Should.ThrowAsync<UserFriendlyException>(() => throttle.CheckAndRegisterSendAsync("user@example.com", OtpSendType.Email));
            ex.Message.ShouldContain("Too many");
        }

        [Fact]
        public async Task Throttle_should_treat_formatting_variations_as_same_destinationAsync()
        {
            var throttle = CreateThrottle(cooldownSeconds: 0, maxSendsPerHour: 2);

            await throttle.CheckAndRegisterSendAsync("082 123 4567", OtpSendType.Sms);
            await throttle.CheckAndRegisterSendAsync("082-123-4567", OtpSendType.Sms);
            await Should.ThrowAsync<UserFriendlyException>(() => throttle.CheckAndRegisterSendAsync("0821234567", OtpSendType.Sms));

            // email and email link share a budget, and case is ignored
            await throttle.CheckAndRegisterSendAsync("User@Example.com", OtpSendType.Email);
            await throttle.CheckAndRegisterSendAsync("user@example.com ", OtpSendType.EmailLink);
            await Should.ThrowAsync<UserFriendlyException>(() => throttle.CheckAndRegisterSendAsync("USER@EXAMPLE.COM", OtpSendType.Email));
        }

        [Fact]
        public async Task Throttle_should_reject_send_when_destination_is_lockedAsync()
        {
            var lockFactory = new Mock<ILockFactory>();
            lockFactory.Setup(f => f.DoExclusiveAsync(It.IsAny<string>(), It.IsAny<TimeSpan>(), It.IsAny<TimeSpan>(), It.IsAny<TimeSpan>(), It.IsAny<Func<Task>>()))
                .ReturnsAsync(false);
            var throttle = CreateThrottle(cooldownSeconds: 0, maxSendsPerHour: 10, lockFactory.Object);

            await Should.ThrowAsync<UserFriendlyException>(() => throttle.CheckAndRegisterSendAsync("0821234567", OtpSendType.Sms));
        }

        [Fact]
        public async Task SendPin_and_ResendPin_should_go_through_throttleAsync()
        {
            var storage = new Dictionary<Guid, OtpDto>();
            var throttle = new Mock<IOtpSendThrottle>();
            var manager = CreateManager(storage, maxVerifyAttempts: 5, throttle.Object);

            var response = await manager.SendPinAsync(new SendPinInput { SendTo = "0821234567", SendType = OtpSendType.Sms });
            await manager.ResendPinAsync(new ResendPinInput { OperationId = response.OperationId });

            throttle.Verify(t => t.CheckAndRegisterSendAsync("0821234567", OtpSendType.Sms), Times.Exactly(2));
        }

        #endregion

        #region Endpoint rate limiting

        [Theory]
        [InlineData(typeof(OtpAppService), nameof(OtpAppService.SendPinAsync))]
        [InlineData(typeof(OtpAppService), nameof(OtpAppService.ResendPinAsync))]
        [InlineData(typeof(OtpAppService), nameof(OtpAppService.VerifyPinAsync))]
        [InlineData(typeof(UserAppService), nameof(UserAppService.ResetPasswordSendOtpAsync))]
        [InlineData(typeof(UserAppService), nameof(UserAppService.SendSmsOtpAsync))]
        [InlineData(typeof(UserAppService), nameof(UserAppService.SendEmailLinkAsync))]
        [InlineData(typeof(UserAppService), nameof(UserAppService.ValidateResetCodeAsync))]
        [InlineData(typeof(UserAppService), nameof(UserAppService.ResetPasswordVerifyOtpAsync))]
        [InlineData(typeof(TokenAuthController), nameof(TokenAuthController.OtpAuthenticateSendPinAsync))]
        [InlineData(typeof(TokenAuthController), nameof(TokenAuthController.OtpAuthenticateAsync))]
        public void Anonymous_otp_endpoints_should_be_rate_limited(Type serviceType, string methodName)
        {
            var method = serviceType.GetMethod(methodName, BindingFlags.Public | BindingFlags.Instance);
            method.ShouldNotBeNull();
            method.GetCustomAttribute<AllowAnonymousAttribute>().ShouldNotBeNull($"{serviceType.Name}.{methodName} is expected to be anonymous");
            method.GetCustomAttribute<EnableRateLimitingAttribute>().ShouldNotBeNull($"{serviceType.Name}.{methodName} must have [EnableRateLimiting]");
        }

        #endregion

        #region Helpers

        private static (OtpManager manager, Dictionary<Guid, OtpDto> storage, Guid operationId) CreateManagerWithOtp(OtpSendType sendType, int maxVerifyAttempts)
        {
            var storage = new Dictionary<Guid, OtpDto>();
            var operationId = Guid.NewGuid();
            storage[operationId] = new OtpDto
            {
                OperationId = operationId,
                Pin = Pin,
                SendType = sendType,
                SendTo = "0821234567",
                ExpiresOn = DateTime.Now.AddMinutes(5),
            };

            return (CreateManager(storage, maxVerifyAttempts, Mock.Of<IOtpSendThrottle>()), storage, operationId);
        }

        private static OtpManager CreateManager(Dictionary<Guid, OtpDto> storage, int maxVerifyAttempts, IOtpSendThrottle throttle)
        {
            var otpStorage = new Mock<IOtpStorage>();
            otpStorage.Setup(s => s.SaveAsync(It.IsAny<OtpDto>())).Returns<OtpDto>(dto =>
            {
                storage[dto.OperationId] = dto;
                return Task.CompletedTask;
            });
            otpStorage.Setup(s => s.GetAsync(It.IsAny<Guid>()))
                .Returns<Guid>(id => Task.FromResult(storage.TryGetValue(id, out var dto) ? dto : null));
            otpStorage.Setup(s => s.UpdateAsync(It.IsAny<Guid>(), It.IsAny<Func<OtpDto, Task>>()))
                .Returns<Guid, Func<OtpDto, Task>>((id, action) => action(storage[id]));
            otpStorage.Setup(s => s.IncrementVerifyAttemptsAsync(It.IsAny<Guid>()))
                .Returns<Guid>(id => Task.FromResult(storage.TryGetValue(id, out var dto) ? ++dto.VerifyAttempts : 0));

            var generator = new Mock<IOtpGenerator>();
            generator.Setup(g => g.GeneratePin()).Returns(Pin);

            var smsGatewayFactory = new Mock<ISmsGatewayFactory>();
            smsGatewayFactory.Setup(f => f.GetSmsGatewayAsync()).ReturnsAsync(new NullSmsGateway());

            var otpSettings = MockOtpSettings(new OtpSettings
            {
                DefaultLifetime = 180,
                MaxVerifyAttempts = maxVerifyAttempts,
                DefaultBodyTemplate = OtpDefaults.DefaultBodyTemplate,
            });

            return new OtpManager(smsGatewayFactory.Object, Mock.Of<IEmailSender>(), otpStorage.Object, generator.Object, otpSettings, throttle);
        }

        private static CacheOtpStorage CreateCacheOtpStorage(OtpDto otp)
        {
            // stores copies, like a distributed cache, and yields between read and write so that unsynchronized
            // read-modify-write would lose updates
            var store = new ConcurrentDictionary<Guid, OtpDto>();
            store[otp.OperationId] = otp;
            OtpDto Copy(OtpDto d) => new OtpDto { OperationId = d.OperationId, Pin = d.Pin, ExpiresOn = d.ExpiresOn, SendStatus = d.SendStatus, VerifyAttempts = d.VerifyAttempts };

            var typedCache = new Mock<ITypedCache<Guid, OtpDto>>();
            typedCache.Setup(c => c.GetOrDefaultAsync(It.IsAny<Guid>()))
                .Returns<Guid>(async id =>
                {
                    await Task.Delay(1);
                    return store.TryGetValue(id, out var d) ? Copy(d) : null;
                });
            typedCache.Setup(c => c.SetAsync(It.IsAny<Guid>(), It.IsAny<OtpDto>(), It.IsAny<TimeSpan?>(), It.IsAny<DateTimeOffset?>()))
                .Returns<Guid, OtpDto, TimeSpan?, DateTimeOffset?>(async (id, d, _, _) =>
                {
                    await Task.Delay(1);
                    store[id] = Copy(d);
                });

            var otpCache = new Mock<IOtpCache>();
            otpCache.Setup(c => c.Cache).Returns(typedCache.Object);

            return new CacheOtpStorage(otpCache.Object, new NamedLockFactory());
        }

        private static OtpSendThrottle CreateThrottle(int cooldownSeconds, int maxSendsPerHour, ILockFactory lockFactory = null)
        {
            var store = new Dictionary<string, OtpSendHistory>();
            var typedCache = new Mock<ITypedCache<string, OtpSendHistory>>();
            typedCache.Setup(c => c.GetOrDefaultAsync(It.IsAny<string>()))
                .Returns<string>(key => Task.FromResult(store.TryGetValue(key, out var value) ? value : null));
            typedCache.Setup(c => c.SetAsync(It.IsAny<string>(), It.IsAny<OtpSendHistory>(), It.IsAny<TimeSpan?>(), It.IsAny<DateTimeOffset?>()))
                .Returns<string, OtpSendHistory, TimeSpan?, DateTimeOffset?>((key, value, _, _) =>
                {
                    store[key] = value;
                    return Task.CompletedTask;
                });

            var cacheHolder = new Mock<IOtpSendThrottleCache>();
            cacheHolder.SetupGet(c => c.Cache).Returns(typedCache.Object);

            var securityAccessor = new Mock<ISettingAccessor<SecuritySettings>>();
            securityAccessor.Setup(a => a.GetValueAsync(It.IsAny<SettingManagementContext>()))
                .ReturnsAsync(new SecuritySettings { OtpCooldownSeconds = cooldownSeconds });
            var securitySettings = new Mock<ISecuritySettings>();
            securitySettings.SetupGet(s => s.SecuritySettings).Returns(securityAccessor.Object);

            var otpSettings = MockOtpSettings(new OtpSettings { MaxSendsPerDestinationPerHour = maxSendsPerHour });

            return new OtpSendThrottle(cacheHolder.Object, otpSettings, securitySettings.Object, lockFactory ?? new NamedLockFactory());
        }

        private static IOtpSettings MockOtpSettings(OtpSettings value)
        {
            var accessor = new Mock<ISettingAccessor<OtpSettings>>();
            accessor.Setup(a => a.GetValueAsync(It.IsAny<SettingManagementContext>())).ReturnsAsync(value);
            accessor.Setup(a => a.GetValue(It.IsAny<SettingManagementContext>())).Returns(value);

            var settings = new Mock<IOtpSettings>();
            settings.SetupGet(s => s.OneTimePins).Returns(accessor.Object);
            return settings.Object;
        }

        #endregion
    }
}
