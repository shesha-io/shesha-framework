using System.Threading.Tasks;

namespace Shesha.DynamicEntities.EntityTypeBuilder
{
    public interface IDynamicEntityUpdateHandler
    {
        Task ProcessAsync();
    }
}