using System.Threading.Tasks;

namespace Shesha.DynamicEntities.EntityTypeBuilder
{
    public interface IDynamicEntityUpdateEvent
    {
        Task ProcessAsync();
    }
}
