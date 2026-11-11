using Abp.Dependency;
using Abp.Runtime.Caching;
using Abp.UI;
using Shesha.Cache;
using Shesha.Configuration.Security;
using Shesha.Domain.Enums;
using Shesha.Otp.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
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

        // Serializes check-and-register within this process. The cache has no atomic operations, so the limits are
        // approximate across multiple instances
        private static readonly SemaphoreSlim Lock = new SemaphoreSlim(1, 1);

        private readonly IOtpSendThrottleCache _cache;
        private readonly IOtpSettings _otpSettings;
        private readonly ISecuritySettings _securitySettings;

        public OtpSendThrottle(IOtpSendThrottleCache cache, IOtpSettings otpSettings, ISecuritySettings securitySettings)
        {
            _cache = cache;
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
            }
            finally
            {
                Lock.Release();
            }
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
