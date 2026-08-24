using System.Threading.Tasks;

namespace Shesha.NHibernate.DbHealth
{
    /// <summary>
    /// DB Health checker
    /// </summary>
    public interface IDbHealthChecker
    {
        /// <summary>
        /// Check DB health. Method should throw exception if DB is not healthy
        /// </summary>
        /// <returns></returns>
        Task CheckHealthAsync(CheckHealthArguments args);
    }
}
