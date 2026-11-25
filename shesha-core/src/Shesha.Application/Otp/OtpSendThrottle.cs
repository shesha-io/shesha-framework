using Abp.Dependency;
using Abp.Runtime.Caching;
using Abp.UI;
using Shesha.Cache;
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
    /// History of OTP sends to a single destination
    /// </summary>
    [Serializable]
    public class OtpSendHistory
    {
        /// <summary>
        /// UTC times of the OTP sends within the last hour, or within the cooldown when that is longer
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
        /// <summary>
        /// Default constructor
        /// </summary>
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

        /// <summary>
        /// Default constructor
        /// </summary>
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
                // sends are kept for the hourly cap and for the cooldown, which may be longer than an hour
                var cooldown = TimeSpan.FromSeconds(Math.Max(cooldownSeconds, 0));
                var retention = cooldown > Window ? cooldown : Window;
                var history = await _cache.Cache.GetOrDefaultAsync(key) ?? new OtpSendHistory();
                var retainedSends = history.SentOnUtc.Where(t => t > now - retention).OrderBy(t => t).ToList();

                if (cooldownSeconds > 0 && retainedSends.Any())
                {
                    var nextAllowed = retainedSends.Last().AddSeconds(cooldownSeconds);
                    if (nextAllowed > now)
                    {
                        var secondsRemaining = (int)Math.Ceiling((nextAllowed - now).TotalSeconds);
                        throw new TooManyRequestsException($"An OTP was recently sent. Please wait {secondsRemaining} seconds before requesting a new one.");
                    }
                }

                if (retainedSends.Count(t => t > now - Window) >= maxSends)
                    throw new TooManyRequestsException("Too many OTP requests. Please try again later.");

                retainedSends.Add(now);
                history.SentOnUtc = retainedSends;
                await _cache.Cache.SetAsync(key, history, absoluteExpireTime: new DateTimeOffset(now.Add(retention)));
            }
            finally
            {
                Lock.Release();
            }
        }

        /// <summary>
        /// Normalizes the destination so that formatting variations (spaces, dashes, case) map to the same key
        /// </summary>
        /// <returns>Cache key for the destination, or null if the destination is empty</returns>
        private static string? NormalizeDestination(string sendTo, OtpSendType sendType)
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
