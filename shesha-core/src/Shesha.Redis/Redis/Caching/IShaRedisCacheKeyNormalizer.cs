namespace Shesha.Redis.Caching
{
    public interface IShaRedisCacheKeyNormalizer
    {
        string NormalizeKey(ShaRedisCacheKeyNormalizeArgs args);
    }
}
