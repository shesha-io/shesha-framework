using Abp.Domain.Entities;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Shesha.DeferredUpdate
{
    public interface IDeferredUpdateManager
    {
        bool IsApplicable(string type);

        Task ExecuteUpdateAsync<TPrimaryKey>(IEntity<TPrimaryKey> entity, List<DeferredUpdateItem> items, List<ValidationResult> validationResult);
    }
}
