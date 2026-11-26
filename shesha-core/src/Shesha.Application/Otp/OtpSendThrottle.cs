using Abp.Dependency;
using Abp.UI;
using Shesha.Configuration.Security;
using Shesha.Domain.Enums;
using Shesha.Exceptions;
using Shesha.Otp.Configuration;
using System;
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

        // Serializes check-and-register within this process. The send history is in the database, so all instances apply the
        // same limits, but two instances that check the same destination at the same moment can both let a send through
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
                // sends are kept for the hourly cap and for the cooldown, which may be longer than an hour
                var cooldown = TimeSpan.FromSeconds(Math.Max(cooldownSeconds, 0));
                var retention = cooldown > Window ? cooldown : Window;
                var retainedSends = (await _sendLog.GetSendTimesAsync(key, now - retention)).OrderBy(t => t).ToList();

                if (cooldownSeconds > 0 && retainedSends.Any())
                {
                    var nextAllowed = retainedSends.Last().AddSeconds(cooldownSeconds);
                    if (nextAllowed > now)
                    {
                        var secondsRemaining = SecondsUntil(nextAllowed, now);
                        throw new TooManyRequestsException($"An OTP was recently sent. Please wait {secondsRemaining} seconds before requesting a new one.", secondsRemaining);
                    }
                }

                var sendsInWindow = retainedSends.Where(t => t > now - Window).ToList();
                if (sendsInWindow.Count >= maxSends)
                {
                    // a send is allowed again once enough of the sends in the window have dropped out of it
                    var nextAllowed = sendsInWindow[sendsInWindow.Count - maxSends].Add(Window);
                    throw new TooManyRequestsException("Too many OTP requests. Please try again later.", SecondsUntil(nextAllowed, now));
                }

                await _sendLog.AddAsync(key, now, now - retention);
            }
            finally
            {
                Lock.Release();
            }
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
