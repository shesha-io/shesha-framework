using Abp.Domain.Entities.Auditing;
using Abp.Domain.Repositories;
using FluentValidation;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.Extensions;
using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.NotificationTemplate")]
    public class NotificationTemplate : FullAuditedEntity<Guid>
    {
        public virtual bool IsEnabled { get; set; }

        [StringLength(300)]
        public virtual string Name { get; set; }
        
        [Required]       
        
        public virtual Notification Notification { get; set; }

        [StringLength(int.MaxValue)]
        public virtual string Body { get; set; }

        [StringLength(300)]
        public virtual string Subject { get; set; }
        public virtual RefListNotificationType? SendType { get; set; }
        public virtual RefListNotificationTemplateType? BodyFormat { get; set; }

        public NotificationTemplate()
        {
            IsEnabled = true;
        }
    }

    public class NotificationTemplateValidator : AbstractValidator<NotificationTemplate>
    {
        private readonly IRepository<NotificationTemplate, Guid> _repository;

        public NotificationTemplateValidator(IRepository<NotificationTemplate, Guid> repository)
        {
            _repository = repository;

            RuleFor(x => x.Notification).NotEmpty();
            RuleFor(x => x.Name).NotEmpty().MustAsync(UniqueNameAsync).WithMessage("Template with name '{PropertyValue}' already exists in this notification.");
        }

        private async Task<bool> UniqueNameAsync(NotificationTemplate template, string name, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(name) || template.Notification == null)
                return true;

            var alreadyExist = await _repository.GetAll().Where(m => m.Notification == template.Notification && m.Name.ToLower() == name.ToLower() && m.Id != template.Id).AnyAsync();
            return !alreadyExist;
        }
    }
}
