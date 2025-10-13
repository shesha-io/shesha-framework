using Abp.Domain.Entities.Auditing;
using Abp.Domain.Repositories;
using FluentValidation;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.NotificationTemplate")]
    [SnakeCaseNaming]
    [Table("notification_templates", Schema = "frwk")]
    public class NotificationTemplate : FullAuditedEntity<Guid>, INotificationTemplateProps
    {
        public virtual RefListNotificationMessageFormat MessageFormat { get; set; }
        public virtual NotificationTypeConfig PartOf { get; set; }
        [MaxLength(2000)]
        public virtual string TitleTemplate { get; set; } = string.Empty;
        [MaxLength(int.MaxValue)]
        public virtual string BodyTemplate { get; set; } = string.Empty;

        public NotificationTemplate Clone()
        {
            return new NotificationTemplate {
                PartOf = PartOf,
                MessageFormat = MessageFormat,
                TitleTemplate = TitleTemplate,
                BodyTemplate = BodyTemplate,
            };
        }
    }

    public class NotificationTemplateValidator : AbstractValidator<NotificationTemplate>
    {
        private readonly IRepository<NotificationTemplate, Guid> _repository;

        public NotificationTemplateValidator(IRepository<NotificationTemplate, Guid> repository)
        {
            _repository = repository;

            RuleFor(x => x.MessageFormat).NotEmpty();
            RuleFor(x => x.PartOf).NotNull();
            RuleFor(x => x)
                .MustAsync(UniqueMessageFormatAsync)
                .WithMessage("A template with the same message format and notification type already exists.");
        }

        private async Task<bool> UniqueMessageFormatAsync(NotificationTemplate template, CancellationToken cancellationToken)
        {
            if (template.PartOf == null)
                return true;

            var alreadyExist = await _repository.GetAll()
                .Where(m => m.PartOf == template.PartOf && m.MessageFormat == template.MessageFormat && m.Id != template.Id)
                .AnyAsync();

            return !alreadyExist;
        }
    }

}
