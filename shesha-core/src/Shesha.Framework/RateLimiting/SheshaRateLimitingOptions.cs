using System;

namespace Shesha.RateLimiting
{
    public class SheshaRateLimitingOptions
    {
        public int GlobalPermitLimit { get; set; } = 100;
        public TimeSpan GlobalWindow { get; set; } = TimeSpan.FromMinutes(1);

        public int AuthPermitLimit { get; set; } = 10;
        public TimeSpan AuthWindow { get; set; } = TimeSpan.FromMinutes(1);

        public int OtpPermitLimit { get; set; } = 5;
        public TimeSpan OtpWindow { get; set; } = TimeSpan.FromMinutes(1);

        public TimeSpan RetryAfter { get; set; } = TimeSpan.FromMinutes(1);
    }
}
