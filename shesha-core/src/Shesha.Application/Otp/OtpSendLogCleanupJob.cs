using Abp.Dependency;
using Shesha.Scheduler;
using Shesha.Scheduler.Attributes;
using Shesha.Scheduler.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    /// <summary>
    /// Removes OTP sends that the send limits no longer need from <c>frwk.otp_send_log_items</c>. This runs separately from
    /// sending so that recording a send never waits for a cleanup
    /// </summary>
    [ScheduledJob("6C3B8F0E-2D4A-4E7B-9A51-3F8D2C6B1E94", StartUpMode.Automatic, "0 * * * *" /* every hour */)]
    public class OtpSendLogCleanupJob : ScheduledJobBase<ScheduledJobStatistic>, ITransientDependency
    {
        private readonly IOtpSendLog _sendLog;

        public OtpSendLogCleanupJob(IOtpSendLog sendLog)
        {
            _sendLog = sendLog;
        }

        public override async Task DoExecuteAsync(CancellationToken cancellationToken)
        {
            var deleted = await CleanupAsync(_sendLog);
            Log.Info($"Removed {deleted} OTP send log items");
        }

        /// <summary>
        /// Removes the sends that are older than <see cref="OtpSendThrottle.MaxCooldown"/> (a day). That covers the hourly cap
        /// and the longest cooldown the send limits apply, so no setting is read
        /// </summary>
        /// <returns>Number of sends removed</returns>
        public static async Task<int> CleanupAsync(IOtpSendLog sendLog)
        {
            return await sendLog.DeleteOlderThanAsync(DateTime.UtcNow - OtpSendThrottle.MaxCooldown);
        }
    }
}
