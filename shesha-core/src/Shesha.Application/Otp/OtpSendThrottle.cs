using Abp.Dependency;
using Abp.Runtime.Caching;
using Abp.UI;
using Shesha.Cache;
using Shesha.Configuration.Security;
using Shesha.Domain.Enums;
using Shesha.Locks;
using Shesha.Otp.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    /// <summary>
    /// History of OTP sends to a single destination
    /// </summary>
    [Serializable]
    public class OtpSendHistory
    {
        /// <summary>
        /// UTC times of the OTP sends within the throttling window
        /// </summary>
        public List<DateTime> SentOnUtc { get; set; } = new List<DateTime>();
    }

    /// <summary>
    /// Cache of OTP send history, keyed by normalized destination
    /// </summary>
    public interface IOtpSendThrottleCache : ICacheHolder<string, OtpSendHistory>
    {
    }

    /// <inheritdoc/>
    public class OtpSendThrottleCache : CacheHolder<string, OtpSendHistory>, IOtpSendThrottleCache, ISingletonDependency
    {
        public OtpSendThrottleCache(ICacheManager cacheManager) : base("OtpSendThrottleCache", cacheManager)
        {
        }
    }

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
        private static readonly TimeSpan LockExpiry = TimeSpan.FromSeconds(30);
        private static readonly TimeSpan LockWait = TimeSpan.FromSeconds(10);
        private static readonly TimeSpan LockRetry = TimeSpan.FromMilliseconds(100);

        private readonly IOtpSendThrottleCache _cache;
        private readonly IOtpSettings _otpSettings;
        private readonly ISecuritySettings _securitySettings;
        private readonly ILockFactory _lockFactory;

        public OtpSendThrottle(IOtpSendThrottleCache cache, IOtpSettings otpSettings, ISecuritySettings securitySettings, ILockFactory lockFactory)
        {
            _cache = cache;
            _otpSettings = otpSettings;
            _securitySettings = securitySettings;
            _lockFactory = lockFactory;
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

            // Check-and-register runs under a lock per destination. The lock is local by default and distributed when
            // Redis is configured, in which case the cache is shared too, so the limits hold across instances
            var acquired = await _lockFactory.DoExclusiveAsync($"OtpSendThrottle:{key}", LockExpiry, LockWait, LockRetry, async () =>
            {
                var now = DateTime.UtcNow;
                var history = await _cache.Cache.GetOrDefaultAsync(key) ?? new OtpSendHistory();
                var recentSends = history.SentOnUtc.Where(t => t > now - Window).OrderBy(t => t).ToList();

                if (cooldownSeconds > 0 && recentSends.Any())
                {
                    var nextAllowed = recentSends.Last().AddSeconds(cooldownSeconds);
                    if (nextAllowed > now)
                    {
                        var secondsRemaining = (int)Math.Ceiling((nextAllowed - now).TotalSeconds);
                        throw new UserFriendlyException($"An OTP was recently sent. Please wait {secondsRemaining} seconds before requesting a new one.");
                    }
                }

                if (recentSends.Count >= maxSends)
                    throw new UserFriendlyException("Too many OTP requests. Please try again later.");

                recentSends.Add(now);
                history.SentOnUtc = recentSends;
                await _cache.Cache.SetAsync(key, history, absoluteExpireTime: new DateTimeOffset(now.Add(Window)));
            });

            // another request for the same destination holds the lock
            if (!acquired)
                throw new UserFriendlyException("Too many OTP requests. Please try again later.");
        }

        /// <summary>
        /// Normalizes the destination so that formatting variations (spaces, dashes, case) map to the same key
        /// </summary>
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
