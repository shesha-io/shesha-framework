using System.IO;
using System.Threading.Tasks;
using FirebaseAdmin;

namespace Shesha.Firebase
{
    /// <summary>
    /// Firebase application provider
    /// </summary>
    public interface IFirebaseApplicationManager
    {
        /// <summary>
        /// Get current application
        /// </summary>
        /// <returns></returns>
        FirebaseApp GetApplication();

        /// <summary>
        /// Update ServiceAccountJson file
        /// </summary>
        Task UpdateServiceAccountJson(Stream stream);
    }
}
