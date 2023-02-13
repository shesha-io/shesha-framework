using System.Threading.Tasks;

namespace Shesha.Bootstrappers
{
    /// <summary>
    /// Bootstrapper interface
    /// </summary>
    public interface IBootstrapper
    {
        /// <summary>
        /// Body of the bootstrapper
        /// </summary>
        /// <returns></returns>
        Task Process();
    }
}
