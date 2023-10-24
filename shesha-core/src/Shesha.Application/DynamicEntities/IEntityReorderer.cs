using Abp.Domain.Entities;
using Shesha.DynamicEntities.Dtos;
using System.Reflection;
using System.Threading.Tasks;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Entity reorderer
    /// </summary>
    public interface IEntityReorderer<T, TId, TOrderIndex>: IEntityReorderer where T : Entity<TId>
    {
    }

    public interface IEntityReorderer
    {
        /// <summary>
        /// Reorder entities
        /// </summary>
        /// <param name="input"></param>
        /// <param name="orderIndexProperty"></param>
        /// <returns></returns>
        Task<IReorderResponse> ReorderAsync(ReorderRequest input, PropertyInfo orderIndexProperty);
    }
}
