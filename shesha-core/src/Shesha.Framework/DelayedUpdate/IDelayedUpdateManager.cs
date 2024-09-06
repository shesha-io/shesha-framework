using Abp.Domain.Entities;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Shesha.DelayedUpdate
{
    public interface IDelayedUpdateManager
    {
        bool IsApplicable(string type);

        Task ExecuteUpdateAsync<TPrimaryKey>(IEntity<TPrimaryKey> entity, List<DelayedUpdateItem> items, List<ValidationResult> validationResult);
    }
}
