using Abp.Dependency;
using Abp.UI;
using Shesha.Configuration.Security;
using Shesha.Domain.Enums;
using Shesha.Exceptions;
using Shesha.Otp.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    /// <summary>
    /// Limits how often one-time pins can be sent to the same destination (mobile number or email address),
    /// regardless of which endpoint or user requested them
    /// </summary>
    public interface IOtpSendThrottle
    {
        /// <summary>
        /// Throws a <see cref="UserFriendlyException"/> if an OTP can't be sent to the destination yet,
        /// otherwise registers the send
        /// </summary>
        Task CheckAndRegisterSendAsync(string sendTo, OtpSendType sendType);
    }

    /// <inheritdoc/>
    public class OtpSendThrottle : IOtpSendThrottle, ITransientDependency
    {
        private static readonly TimeSpan Window = TimeSpan.FromHours(1);

        // Avoids needless refusals when requests in this process clash (see CheckAndRegisterSendAsync). Not needed for the
        // limits to hold across instances
        private static readonly SemaphoreSlim Lock = new SemaphoreSlim(1, 1);

        private readonly IOtpSendLog _sendLog;
        private readonly IOtpSettings _otpSettings;
        private readonly ISecuritySettings _securitySettings;

        /// <summary>
        /// Default constructor
        /// </summary>
        public OtpSendThrottle(IOtpSendLog sendLog, IOtpSettings otpSettings, ISecuritySettings securitySettings)
        {
            _sendLog = sendLog;
            _otpSettings = otpSettings;
            _securitySettings = securitySettings;
        }

        /// <inheritdoc/>
        public async Task CheckAndRegisterSendAsync(string sendTo, OtpSendType sendType)
        {
            var key = NormalizeDestination(sendTo, sendType);
            if (string.IsNullOrEmpty(key))
                return;

            var otpSettings = await _otpSettings.OneTimePins.GetValueAsync();
            var maxSends = otpSettings.MaxSendsPerDestinationPerHour > 0
                ? otpSettings.MaxSendsPerDestinationPerHour
                : OtpDefaults.DefaultMaxSendsPerDestinationPerHour;
            var cooldownSeconds = (await _securitySettings.SecuritySettings.GetValueAsync())?.OtpCooldownSeconds ?? 0;

            await Lock.WaitAsync();
            try
            {
                var now = DateTime.UtcNow;
                var retention = GetRetention(cooldownSeconds);
                // The send is recorded (and committed) before the history is read, and removed again if it isn't allowed. Of two
                // requests for the same destination on different instances, the one that reads last sees the other's record,
                // so they can't both get through. If they clash, both may be refused
                var id = await _sendLog.AddAsync(key, now);
                var otherSends = (await _sendLog.GetSendsAsync(key, now - retention))
                    .Where(s => s.Id != id)
                    .Select(s => s.SentOnUtc)
                    .OrderBy(t => t)
                    .ToList();

                var refusal = GetRefusal(otherSends, now, cooldownSeconds, maxSends);
                if (refusal != null)
                {
                    await _sendLog.RemoveAsync(id);
                    throw refusal;
                }
            }
            finally
            {
                Lock.Release();
            }
        }

        /// <summary>
        /// How long sends are needed: for the hourly cap, and for the cooldown, which may be longer than an hour. Older sends
        /// are ignored, and removed by <see cref="OtpSendLogCleanupJob"/>
        /// </summary>
        public static TimeSpan GetRetention(int cooldownSeconds)
        {
            var cooldown = TimeSpan.FromSeconds(Math.Max(cooldownSeconds, 0));
            return cooldown > Window ? cooldown : Window;
        }

        /// <summary>
        /// Returns the exception to throw if a send isn't allowed yet, otherwise null
        /// </summary>
        private static TooManyRequestsException GetRefusal(List<DateTime> otherSends, DateTime now, int cooldownSeconds, int maxSends)
        {
            if (cooldownSeconds > 0 && otherSends.Any())
            {
                var nextAllowed = otherSends.Last().AddSeconds(cooldownSeconds);
                if (nextAllowed > now)
                {
                    var secondsRemaining = SecondsUntil(nextAllowed, now);
                    return new TooManyRequestsException($"An OTP was recently sent. Please wait {secondsRemaining} seconds before requesting a new one.", secondsRemaining);
                }
            }

            var sendsInWindow = otherSends.Where(t => t > now - Window).ToList();
            if (sendsInWindow.Count >= maxSends)
            {
                // a send is allowed again once enough of the sends in the window have dropped out of it
                var nextAllowed = sendsInWindow[sendsInWindow.Count - maxSends].Add(Window);
                return new TooManyRequestsException("Too many OTP requests. Please try again later.", SecondsUntil(nextAllowed, now));
            }

            return null;
        }

        private static int SecondsUntil(DateTime time, DateTime now)
        {
            return Math.Max((int)Math.Ceiling((time - now).TotalSeconds), 1);
        }

        /// <summary>
        /// Normalizes the destination so that formatting variations (spaces, dashes, case) map to the same key
        /// </summary>
        /// <returns>Key for the destination, or null if the destination is empty</returns>
        private static string NormalizeDestination(string sendTo, OtpSendType sendType)
        {
            if (string.IsNullOrWhiteSpace(sendTo))
                return null;

            var normalized = sendType == OtpSendType.Sms
                ? new string(sendTo.Where(char.IsDigit).ToArray())
                : sendTo.Trim().ToLowerInvariant();

            // email and email link share the same budget
            var channel = sendType == OtpSendType.Sms ? "sms" : "email";
            return string.IsNullOrEmpty(normalized)
                ? null
                : $"{channel}:{normalized}";
        }
    }
}
