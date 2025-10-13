using Abp.Specifications;
using Shesha.Domain;
using System;
using System.Linq.Expressions;

namespace Shesha.ConfigurationItems.Specifications
{
    /// <summary>
    /// Specification to find configuration item by name and module
    /// </summary>
    public class ByNameAndModuleSpecification<TItem> : ISpecification<TItem> where TItem : ConfigurationItem
    {
        public string Name { get; private set; }
        public string? ModuleName { get; private set; }

        public ByNameAndModuleSpecification(string name, string? moduleName)
        {
            Name = name;
            ModuleName = moduleName;
        }

        public bool IsSatisfiedBy(TItem obj)
        {
            return string.IsNullOrWhiteSpace(ModuleName)
                ? obj.Name == Name && obj.Module == null
                : obj.Name == Name && obj.Module?.Name == ModuleName;
        }

        public Expression<Func<TItem, bool>> ToExpression()
        {
            return string.IsNullOrWhiteSpace(ModuleName)
                ? item => item.Name == Name && item.Module == null
                : item => item.Name == Name && item.Module != null && item.Module.Name == ModuleName;
        }
    }
}
