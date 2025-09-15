using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    public interface INotificationTemplateProps
    {
        RefListNotificationMessageFormat MessageFormat { get; set; }
        string TitleTemplate { get; set; }
        string BodyTemplate { get; set; }
    }
}
