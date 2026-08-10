namespace Shesha.RateLimiting
{
    public class SheshaRateLimitingOptions
    {
        public int AuthPermitLimit { get; set; } = 10;
        public int AuthWindowSeconds { get; set; } = 60;

        public int OtpPermitLimit { get; set; } = 5;
        public int OtpWindowSeconds { get; set; } = 60;

        public int RetryAfterSeconds { get; set; } = 60;
    }
}
