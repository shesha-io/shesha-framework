using Abp.Domain.Entities.Auditing;
using Abp.Domain.Repositories;
using FluentValidation;
using Shesha.Domain.Attributes;
using Shesha.Extensions;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    /// <summary>
    /// Module
    /// </summary>
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.AlwaysGenerateApplicationService)]
    [Table("modules", Schema = "frwk")]
    [SnakeCaseNaming]
    public class Module: FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Module name
        /// </summary>
        [MaxLength(300)]
        public required virtual string Name { get; set; }

        /// <summary>
        /// Friendly name
        /// </summary>
        [MaxLength(200)]
        public virtual string? FriendlyName { get; set; }

        /// <summary>
        /// Module description
        /// </summary>
        [MaxLength(int.MaxValue)]
        public virtual string? Description { get; set; }

        /// <summary>
        /// Publisher
        /// </summary>
        [MaxLength(200)]
        public virtual string? Publisher { get; set; }

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
        [MaxLength(50)]
        public virtual string? CurrentVersionNo { get; set; }

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

        /// <summary>
        /// Code identifier that can be used in the client-side code to reference current module
        /// </summary>
        [MaxLength(200)]
        public virtual string? Accessor { get; set; }

        public override string? ToString()
        {
            return !string.IsNullOrWhiteSpace(FriendlyName)
                ? FriendlyName
                : Name;
        }
    }

    public class ModuleValidator : AbstractValidator<Module>
    {
        private readonly IRepository<Module, Guid> _repository;

        public ModuleValidator(IRepository<Module, Guid> repository)
        {
            _repository = repository;

            RuleFor(x => x.Name).NotEmpty().MustAsync(UniqueNameAsync).WithMessage("Module with name '{PropertyValue}' already exists.");
        }

        private async Task<bool> UniqueNameAsync(Module module, string name, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(name))
                return true;

            var alreadyExist = await _repository.GetAll().Where(m => m.Name.ToLower() == name.ToLower() && m.Id != module.Id).AnyAsync();
            return !alreadyExist;
        }
    }
}
