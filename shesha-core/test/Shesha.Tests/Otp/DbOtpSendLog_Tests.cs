using Moq;
using Shesha.Configuration.Security;
using Shesha.Domain.Enums;
using Shesha.Exceptions;
using Shesha.Otp;
using Shesha.Otp.Configuration;
using Shesha.Settings;
using Shesha.Testing.Fixtures;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Otp
{
    [Collection(SqlServerCollection.Name)]
    public class DbOtpSendLog_Tests : SheshaNhTestBase
    {
        public DbOtpSendLog_Tests(SqlServerFixture fixture) : base(fixture)
        {
        }

        [Fact]
        public async Task Should_return_sends_to_the_destination_since_the_specified_time_TestAsync()
        {
            var log = Resolve<DbOtpSendLog>();
            var destination = $"sms:{Guid.NewGuid():N}";
            var other = $"sms:{Guid.NewGuid():N}";
            var now = DateTime.UtcNow;

            await log.AddAsync(destination, now.AddMinutes(-30));
            await log.AddAsync(destination, now.AddMinutes(-5));
            await log.AddAsync(other, now.AddMinutes(-5));

            var times = await log.GetSendsAsync(destination, now.AddMinutes(-10));
            times.Count.ShouldBe(1);
            (await log.GetSendsAsync(destination, now.AddHours(-1))).Count.ShouldBe(2);
        }

        [Fact]
        public async Task Should_delete_sends_older_than_the_specified_time_TestAsync()
        {
            var log = Resolve<DbOtpSendLog>();
            var destination = $"sms:{Guid.NewGuid():N}";
            var now = DateTime.UtcNow;

            await log.AddAsync(destination, now.AddHours(-3));
            await log.AddAsync(destination, now);

            // recording a send doesn't remove old sends...
            (await log.GetSendsAsync(destination, now.AddDays(-1))).Count.ShouldBe(2);

            // ...the cleanup job does
            (await log.DeleteOlderThanAsync(now.AddHours(-2))).ShouldBeGreaterThanOrEqualTo(1);
            (await log.GetSendsAsync(destination, now.AddDays(-1))).Count.ShouldBe(1);
        }

        [Fact]
        public async Task Throttle_should_count_sends_stored_in_the_database_TestAsync()
        {
            // the history is in the database, so a send registered by one throttle (e.g. on another instance) limits the next
            var mobileNo = "08" + new Random().Next(10000000, 99999999);
            await Resolve<IOtpSendThrottle>().CheckAndRegisterSendAsync(mobileNo, OtpSendType.Sms);

            var log = Resolve<IOtpSendLog>();
            log.ShouldBeOfType<DbOtpSendLog>();
            (await log.GetSendsAsync($"sms:27{mobileNo[1..]}", DateTime.UtcNow.AddMinutes(-1))).Count.ShouldBe(1);
        }

        [Fact]
        public async Task Concurrent_sends_should_see_each_other_TestAsync()
        {
            // two instances both record a send to the same destination before either reads the history: each must see the
            // other's committed record, so the throttle on both instances refuses (and neither send gets through)
            var instanceA = Resolve<DbOtpSendLog>();
            var instanceB = Resolve<DbOtpSendLog>();
            var destination = $"sms:{Guid.NewGuid():N}";
            var now = DateTime.UtcNow;

            var idA = await instanceA.AddAsync(destination, now);
            var idB = await instanceB.AddAsync(destination, now);

            (await instanceA.GetSendsAsync(destination, now.AddMinutes(-1))).Select(s => s.Id).ShouldContain(idB);
            (await instanceB.GetSendsAsync(destination, now.AddMinutes(-1))).Select(s => s.Id).ShouldContain(idA);
        }

        [Theory]
        [InlineData(60, 10)] // cooldown
        [InlineData(0, 1)] // hourly cap of one
        public async Task Throttle_should_refuse_when_another_instance_records_a_send_concurrently_TestAsync(int cooldownSeconds, int maxSendsPerHour)
        {
            // Two instances, each with its own DbOtpSendLog on the shared database. Instance B records its send after
            // instance A recorded its own but before A reads the history, the interleaving the throttle has to handle
            var mobileNo = "08" + new Random().Next(10000000, 99999999);
            var destination = $"sms:27{mobileNo[1..]}";
            var instanceB = Resolve<DbOtpSendLog>();
            var instanceA = new InterleavingSendLog(Resolve<DbOtpSendLog>(),
                async () => await instanceB.AddAsync(destination, DateTime.UtcNow));

            var throttleA = CreateThrottle(instanceA, cooldownSeconds, maxSendsPerHour);
            await Should.ThrowAsync<TooManyRequestsException>(() => throttleA.CheckAndRegisterSendAsync(mobileNo, OtpSendType.Sms));

            // A removed its refused send; only B's send is left in the database
            (await instanceB.GetSendsAsync(destination, DateTime.UtcNow.AddMinutes(-1))).Count.ShouldBe(1);
        }

        private static OtpSendThrottle CreateThrottle(IOtpSendLog sendLog, int cooldownSeconds, int maxSendsPerHour)
        {
            var securityAccessor = new Mock<ISettingAccessor<SecuritySettings>>();
            securityAccessor.Setup(a => a.GetValueAsync(It.IsAny<SettingManagementContext>()))
                .ReturnsAsync(new SecuritySettings { OtpCooldownSeconds = cooldownSeconds });
            var securitySettings = new Mock<ISecuritySettings>();
            securitySettings.SetupGet(s => s.SecuritySettings).Returns(securityAccessor.Object);

            var otpAccessor = new Mock<ISettingAccessor<OtpSettings>>();
            otpAccessor.Setup(a => a.GetValueAsync(It.IsAny<SettingManagementContext>()))
                .ReturnsAsync(new OtpSettings { MaxSendsPerDestinationPerHour = maxSendsPerHour });
            var otpSettings = new Mock<IOtpSettings>();
            otpSettings.SetupGet(s => s.OneTimePins).Returns(otpAccessor.Object);

            return new OtpSendThrottle(sendLog, otpSettings.Object, securitySettings.Object);
        }

        /// <summary>
        /// A database send log that runs another instance's action once, right after recording its own send
        /// </summary>
        private class InterleavingSendLog : IOtpSendLog
        {
            private readonly IOtpSendLog _inner;
            private Func<Task>? _afterAdd;

            public InterleavingSendLog(IOtpSendLog inner, Func<Task> afterAdd)
            {
                _inner = inner;
                _afterAdd = afterAdd;
            }

            public async Task<Guid> AddAsync(string destination, DateTime sentOnUtc)
            {
                var id = await _inner.AddAsync(destination, sentOnUtc);
                var afterAdd = _afterAdd;
                _afterAdd = null;
                if (afterAdd != null)
                    await afterAdd();
                return id;
            }

            public Task<List<OtpSendRecord>> GetSendsAsync(string destination, DateTime sinceUtc) => _inner.GetSendsAsync(destination, sinceUtc);

            public Task RemoveAsync(Guid id) => _inner.RemoveAsync(id);

            public Task<int> DeleteOlderThanAsync(DateTime utc) => _inner.DeleteOlderThanAsync(utc);
        }

        [Fact]
        public async Task Should_remove_a_send_TestAsync()
        {
            var log = Resolve<DbOtpSendLog>();
            var destination = $"sms:{Guid.NewGuid():N}";
            var now = DateTime.UtcNow;

            var id = await log.AddAsync(destination, now);
            var kept = await log.AddAsync(destination, now.AddSeconds(-1));
            await log.RemoveAsync(id);

            (await log.GetSendsAsync(destination, now.AddMinutes(-1))).Select(s => s.Id).ShouldBe(new[] { kept });
        }

        [Fact]
        public async Task Throttle_should_refuse_a_send_recorded_by_another_instance_without_counting_it_TestAsync()
        {
            // a send recorded by another instance, e.g. a moment ago
            var mobileNo = "08" + new Random().Next(10000000, 99999999);
            var log = Resolve<IOtpSendLog>();
            await log.AddAsync($"sms:27{mobileNo[1..]}", DateTime.UtcNow);

            // the default 60 second cooldown refuses the next send
            await Should.ThrowAsync<TooManyRequestsException>(() => Resolve<IOtpSendThrottle>().CheckAndRegisterSendAsync(mobileNo, OtpSendType.Sms));

            // the refused send was removed again
            (await log.GetSendsAsync($"sms:27{mobileNo[1..]}", DateTime.UtcNow.AddMinutes(-1))).Count.ShouldBe(1);
        }
    }
}
