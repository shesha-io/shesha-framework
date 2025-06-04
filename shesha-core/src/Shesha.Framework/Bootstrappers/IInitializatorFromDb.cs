using Abp.Dependency;
using System.Threading.Tasks;

namespace Shesha.Bootstrappers
{
    /// <summary>
    /// Initializator interface
    /// </summary>
    public interface IInitializatorFromDb
    {
        /// <summary>
        /// Body of the initializator
        /// </summary>
        /// <returns></returns>
        Task ProcessAsync();
    }
}
