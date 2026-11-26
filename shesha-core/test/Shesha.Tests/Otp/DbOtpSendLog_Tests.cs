using Shesha.Domain.Enums;
using Shesha.Exceptions;
using Shesha.Otp;
using Shouldly;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Otp
{
    public class DbOtpSendLog_Tests : SheshaNhTestBase
    {
        [Fact]
        public async Task Should_return_sends_to_the_destination_since_the_specified_time_TestAsync()
        {
            var log = Resolve<DbOtpSendLog>();
            var destination = $"sms:{Guid.NewGuid():N}";
            var other = $"sms:{Guid.NewGuid():N}";
            var now = DateTime.UtcNow;

            await log.AddAsync(destination, now.AddMinutes(-30), now.AddDays(-1));
            await log.AddAsync(destination, now.AddMinutes(-5), now.AddDays(-1));
            await log.AddAsync(other, now.AddMinutes(-5), now.AddDays(-1));

            var times = await log.GetSendTimesAsync(destination, now.AddMinutes(-10));
            times.Count.ShouldBe(1);
            (await log.GetSendTimesAsync(destination, now.AddHours(-1))).Count.ShouldBe(2);
        }

        [Fact]
        public async Task Should_remove_sends_older_than_the_retention_TestAsync()
        {
            var log = Resolve<DbOtpSendLog>();
            var destination = $"sms:{Guid.NewGuid():N}";
            var now = DateTime.UtcNow;

            await log.AddAsync(destination, now.AddHours(-3), now.AddDays(-1));
            await log.AddAsync(destination, now, now.AddHours(-2));

            (await log.GetSendTimesAsync(destination, now.AddDays(-1))).Count.ShouldBe(1);
        }

        [Fact]
        public async Task Throttle_should_count_sends_stored_in_the_database_TestAsync()
        {
            // the history is in the database, so a send registered by one throttle (e.g. on another instance) limits the next
            var mobileNo = "08" + new Random().Next(10000000, 99999999);
            await Resolve<IOtpSendThrottle>().CheckAndRegisterSendAsync(mobileNo, OtpSendType.Sms);

            var log = Resolve<IOtpSendLog>();
            log.ShouldBeOfType<DbOtpSendLog>();
            (await log.GetSendTimesAsync($"sms:{mobileNo}", DateTime.UtcNow.AddMinutes(-1))).Count.ShouldBe(1);
        }
    }
}
