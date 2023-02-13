using Abp.Domain.Repositories;
using Abp.Linq;
using Abp.Runtime.Validation;
using FluentValidation;
using Shesha.Domain.Attributes;
using Shesha.Services;
using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Domain.ConfigurationItems
{
    /// <summary>
    /// Module
    /// </summary>
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.AlwaysGenerateApplicationService)]
    public class Module: FullPowerEntity, ICustomValidate
    {
        /// <summary>
        /// Module name
        /// </summary>
        [StringLength(200)]
        public virtual string Name { get; set; }

        /// <summary>
        /// Friendly name
        /// </summary>
        [StringLength(200)]
        public virtual string FriendlyName { get; set; }

        /// <summary>
        /// Module description
        /// </summary>
        [StringLength(int.MaxValue)]
        public virtual string Description { get; set; }

        /// <summary>
        /// Publisher
        /// </summary>
        [StringLength(200)]
        public virtual string Publisher { get; set; }

        /// <summary>
        /// Is editable
        /// </summary>
        public virtual bool IsEditable { get; set; }

        /// <summary>
        /// Is root module
        /// </summary>
        public virtual bool IsRootModule { get; set; }

        /// <summary>
        /// Current version no
        /// </summary>
        [StringLength(50)]
        public virtual string CurrentVersionNo { get; set; }

        /// <summary>
        /// First initialization date
        /// </summary>
        public virtual DateTime? FirstInitializedDate { get; set; }

        /// <summary>
        /// Last initialization date
        /// </summary>
        public virtual DateTime? LastInitializedDate { get; set; }        

        /// <summary>
        /// If true, indicates that the module is enabled
        /// </summary>
        public virtual bool IsEnabled { get; set; }

        public void AddValidationErrors(CustomValidationContext context)
        {
            
        }
    }

    public class ModuleValidator : AbstractValidator<Module>
    {
        public ModuleValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MustAsync(UniqueNameAsync).WithMessage("Module with name '{PropertyValue}' already exists.");
        }

        private async Task<bool> UniqueNameAsync(Module module, string name, CancellationToken cancellationToken)
        {
            var repository = StaticContext.IocManager.Resolve<IRepository<Module, Guid>>();
            var asyncExecuter = StaticContext.IocManager.Resolve<IAsyncQueryableExecuter>();

            if (string.IsNullOrWhiteSpace(name))
                return true;

            var query = repository.GetAll().Where(m => m.Name.ToLower() == name.ToLower() && m.Id != module.Id);
            var alreadyExist = await asyncExecuter.AnyAsync(query);
            return !alreadyExist;
        }
    }
}
