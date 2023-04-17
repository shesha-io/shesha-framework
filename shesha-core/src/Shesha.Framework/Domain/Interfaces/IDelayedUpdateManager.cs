using Abp.Domain.Entities;
using NHibernate.Mapping;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain.Interfaces
{
    public interface IDelayedUpdateManager
    {
        bool IsApplicable(string type);

        Task ExecuteAsync<TPrimaryKey>(IEntity<TPrimaryKey> entity, List<DelayedUpdateItem> items, List<ValidationResult> validationResult);
    }
}
