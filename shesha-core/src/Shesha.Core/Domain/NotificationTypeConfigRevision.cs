using Shesha.Domain.Attributes;
using Shesha.Extensions;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json;

namespace Shesha.Domain
{
    [JoinedProperty("notification_type_revisions", Schema = "frwk")]
    [SnakeCaseNaming]
    [Prefix(UsePrefixes = false)]
    [DiscriminatorValue(NotificationTypeConfig.ItemTypeName)]
    public class NotificationTypeConfigRevision : ConfigurationItemRevision, INotificationTypeSpecificProps
    {
        /// <summary>
        /// 
        /// </summary>
        public virtual bool Disable { get; set; }
        /// <summary>
        /// If true indicates that users may opt out of this notification
        /// </summary>
        public virtual bool CanOptOut { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual string Category { get; set; }

        /// <summary>
        /// Serialized JSON string representing override channels.
        /// </summary>
        [MaxLength(int.MaxValue)]
        public virtual string? OverrideChannels { get; set; }

        private List<NotificationChannelIdentifier> _parsedOverrideChannels;

        /// <summary>
        /// Deserialized override channels as composite identifiers.
        /// </summary>
        [NotMapped]
        public virtual List<NotificationChannelIdentifier> ParsedOverrideChannels
        {
            get
            {
                if (_parsedOverrideChannels == null && !string.IsNullOrEmpty(OverrideChannels))
                {
                    try
                    {
                        var jsonStrings = JsonSerializer.Deserialize<List<string>>(OverrideChannels) ?? new();

                        _parsedOverrideChannels = jsonStrings
                            .Select(json => JsonSerializer.Deserialize<NotificationChannelIdentifier>(json, new JsonSerializerOptions
                            {
                                PropertyNameCaseInsensitive = true
                            }))
                            .WhereNotNull()
                            .ToList();
                    }
                    catch (JsonException)
                    {
                        _parsedOverrideChannels = new List<NotificationChannelIdentifier>();
                    }
                }

                return _parsedOverrideChannels ?? new List<NotificationChannelIdentifier>();
            }
            set
            {
                _parsedOverrideChannels = value;

                if (value != null)
                {
                    // Serialize each channel to a JSON string
                    var jsonStrings = value.Select(channel =>
                        JsonSerializer.Serialize(channel)).ToList();

                    // Then serialize the list of JSON strings
                    OverrideChannels = JsonSerializer.Serialize(jsonStrings);
                }
                else
                {
                    OverrideChannels = null;
                }
            }
        }

        /// <summary>
        ///  messages without which the user should not proceed in any case e.g. OTP
        /// </summary>
        public virtual bool IsTimeSensitive { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public virtual bool AllowAttachments { get; set; }
    }
}
