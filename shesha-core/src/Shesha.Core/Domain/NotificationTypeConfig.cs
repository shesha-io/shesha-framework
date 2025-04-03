using Shesha.Domain.Attributes;
using Shesha.Domain.ConfigurationItems;
using Shesha.Extensions;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json;

namespace Shesha.Domain
{
    [DiscriminatorValue(ItemTypeName)]
    [JoinedProperty("Core_NotificationTypeConfigs")]
    [Entity(TypeShortAlias = "Shesha.Domain.NotificationTypeConfig")]
    public class NotificationTypeConfig : ConfigurationItemBase, INotificationTypeSpecificProps
    {
        public NotificationTypeConfig()
        {
            Init();
        }

        private void Init()
        {
            VersionStatus = ConfigurationItemVersionStatus.Draft;
        }

        /// <summary>
        /// 
        /// </summary>
        public const string ItemTypeName = "notification-type";

        /// <summary>
        /// 
        /// </summary>
        public override string ItemType => ItemTypeName;
        /// <summary>
        /// 
        /// </summary>
        public bool AllowAttachments { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public bool Disable { get; set; }
        /// <summary>
        /// If true indicates that users may opt out of this notification
        /// </summary>
        public bool CanOptOut { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public string Category { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public int OrderIndex { get; set; }

        /// <summary>
        /// Serialized JSON string representing override channels.
        /// </summary>
        [StringLength(int.MaxValue)]
        public string? OverrideChannels { get; set; }

        private List<NotificationChannelIdentifier> _parsedOverrideChannels;

        /// <summary>
        /// Deserialized override channels as composite identifiers.
        /// </summary>
        [NotMapped]
        public List<NotificationChannelIdentifier> ParsedOverrideChannels
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
        public bool IsTimeSensitive { get; set; }
    }
}
