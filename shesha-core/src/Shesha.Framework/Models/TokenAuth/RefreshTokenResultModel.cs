using System;

namespace Shesha.Models.TokenAuth
{
    /// <summary>
    /// Simplified response model for token refresh endpoint.
    /// Only includes fields needed by the frontend to update the token.
    /// </summary>
    public class RefreshTokenResultModel
    {
        public string AccessToken { get; set; }

        public int ExpireInSeconds { get; set; }

        public DateTime ExpireOn { get; set; }
    }
}
