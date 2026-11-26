using Abp.Dependency;
using Shesha.Configuration.Security;
using Shesha.Scheduler;
using Shesha.Scheduler.Attributes;
using Shesha.Scheduler.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    /// <summary>
    /// Removes OTP sends that the send limits no longer need from <c>Frwk_OtpSendLogItems</c>. This runs separately from
    /// sending so that recording a send never waits for a cleanup
    /// </summary>
    [ScheduledJob("6C3B8F0E-2D4A-4E7B-9A51-3F8D2C6B1E94", StartUpMode.Automatic, "0 * * * *" /* every hour */)]
    public class OtpSendLogCleanupJob : ScheduledJobBase<ScheduledJobStatistic>, ITransientDependency
    {
        private readonly IOtpSendLog _sendLog;
        private readonly ISecuritySettings _securitySettings;

        public OtpSendLogCleanupJob(IOtpSendLog sendLog, ISecuritySettings securitySettings)
        {
            _sendLog = sendLog;
            _securitySettings = securitySettings;
        }

        public override async Task DoExecuteAsync(CancellationToken cancellationToken)
        {
            var deleted = await CleanupAsync(_sendLog, _securitySettings);
            Log.Info($"Removed {deleted} OTP send log items");
        }

        /// <summary>
        /// Removes the sends that are older than the throttle's retention
        /// </summary>
        /// <returns>Number of sends removed</returns>
        public static async Task<int> CleanupAsync(IOtpSendLog sendLog, ISecuritySettings securitySettings)
        {
            var cooldownSeconds = (await securitySettings.SecuritySettings.GetValueAsync())?.OtpCooldownSeconds ?? 0;
            return await sendLog.DeleteOlderThanAsync(DateTime.UtcNow - OtpSendThrottle.GetRetention(cooldownSeconds));
        }
    }
}
