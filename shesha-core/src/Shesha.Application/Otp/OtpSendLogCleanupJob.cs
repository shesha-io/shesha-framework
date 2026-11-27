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
    /// <remarks>
    /// Each send stores its own keep-until time, worked out from the cooldown that applied when it was sent, so the job doesn't
    /// read any setting: the cooldown can differ between tenants and front-end applications
    /// </remarks>
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
        /// Removes the sends whose keep-until time has passed
        /// </summary>
        /// <returns>Number of sends removed</returns>
        public static async Task<int> CleanupAsync(IOtpSendLog sendLog)
        {
            return await sendLog.DeleteExpiredAsync(DateTime.UtcNow);
        }
    }
}
