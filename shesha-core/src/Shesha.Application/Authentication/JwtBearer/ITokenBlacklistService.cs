using System;
using System.Threading.Tasks;

namespace Shesha.Authentication.JwtBearer
{
    /// <summary>
    /// JWT tokens blacklist service
    /// </summary>
    public interface ITokenBlacklistService
    {
        /// <summary>
        /// Add token to blacklist
        /// </summary>
        /// <param name="tokenId">Token to blacklist</param>
        /// <param name="expirationDate">Token expiration date</param>
        /// <returns></returns>
        Task BlacklistTokenAsync(string tokenId, DateTime? expirationDate);

        /// <summary>
        /// Checks if token is blacklisted
        /// </summary>
        /// <param name="tokenId">Token to check</param>
        /// <returns></returns>
        Task<bool> IsTokenBlacklistedAsync(string tokenId);

        /// <summary>
        /// Atomically attempts to blacklist a token if it's not already blacklisted.
        /// This operation is thread-safe and prevents TOCTOU race conditions.
        /// </summary>
        /// <param name="tokenId">Token to blacklist</param>
        /// <param name="expirationDate">Token expiration date</param>
        /// <returns>True if the token was successfully blacklisted (first time); False if it was already blacklisted</returns>
        Task<bool> TryBlacklistTokenAsync(string tokenId, DateTime? expirationDate);

        /// <summary>
        /// Remove expired tokens
        /// </summary>
        /// <returns></returns>
        Task CleanupExpiredTokensAsync();
    }
}
