using System.Threading.Tasks;

namespace Shesha.ConfigurationItems.Distribution
{
    /// <summary>
    /// Configuration packages seeder. Is used for automatical unpacking and importing (seeding) of `.spaconfig` packages
    /// </summary>
    public interface IEmbeddedPackageSeeder
    {
        /// <summary>
        /// Seed packages attached as embedded resource to the specified assembly
        /// </summary>
        Task<bool> SeedEmbeddedPackagesAsync(EmbeddedPackageSeedingContext context);
    }
}
