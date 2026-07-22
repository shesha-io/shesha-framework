using Shesha.Cache;

namespace Shesha.Authentication.JwtBearer
{
    /// <summary>
    /// Token blacklist cache holder.
    /// Stored blocked tokens to prevent unneeded DB calls
    /// </summary>
    public interface ITokenBlacklistCacheHolder : ICacheHolder<string, bool>
    {
    }
}
