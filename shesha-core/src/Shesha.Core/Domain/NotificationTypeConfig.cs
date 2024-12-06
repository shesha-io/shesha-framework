using Microsoft.Extensions.Logging;
using Shesha.Domain.Attributes;
using Shesha.Domain.ConfigurationItems;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    [DiscriminatorValue(ItemTypeName)]
    [JoinedProperty("Core_NotificationTypeConfigs")]
    [Entity(TypeShortAlias = "Shesha.Domain.NotificationTypeConfig")]
    public class NotificationTypeConfig: ConfigurationItemBase
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
        public bool CanOtpOut { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public string Category { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public int OrderIndex { get; set; }

        //private string _overrideChannels;

        /// <summary>
        /// Serialized JSON string representing override channels.
        /// </summary>
        [StringLength(int.MaxValue)]
        public string OverrideChannels 
        {
            //get => _overrideChannels;
            //set
            //{
            //    _overrideChannels = value;
            //    _parsedOverrideChannels = null; // Reset cached deserialized value
            //}
            get; set;
        }

        //private List<FormIdentifier> _parsedOverrideChannels;

        ///// <summary>
        ///// Deserialized override channels as composite identifiers.
        ///// </summary>
        //[NotMapped]
        //public List<FormIdentifier> ParsedOverrideChannels
        //{
        //    get
        //    {
        //        // Only parse if it's not already parsed, and if the raw data is available
        //        if (_parsedOverrideChannels == null && !string.IsNullOrWhiteSpace(_overrideChannels))
        //        {
        //            try
        //            {
        //                //// Step 1: Remove unwanted escape sequences
        //                //string cleanedInput = _overrideChannels.Replace("\\\"", "\"").Replace("\r\n", "").Trim();

        //                //// Step 2: Replace individual entries with proper JSON object structure
        //                //cleanedInput = cleanedInput.Replace("},{", "}, {").Replace("\"", "");

        //                //// For each string, deserialize it into a FormIdentifier object
        //                //_parsedOverrideChannels = cleanedInput
        //                //    .Select(item => JsonSerializer.Deserialize<FormIdentifier>(item))
        //                //    .Where(deserialized => deserialized != null)
        //                //    .ToList();

        //                //string unescapedInput = _overrideChannels
        //                //   .Replace("\\\"", "\"") // Unescape quotes
        //                //   .Replace("\r\n", "")  // Remove newlines
        //                //   .Trim('[', ']')       // Remove outer brackets
        //                //   .Trim();              // Trim any additional whitespace

        //                //// Step 2: Parse each individual object string
        //                //var individualItems = unescapedInput
        //                //    .Split(new[] { "\",\"" }, StringSplitOptions.RemoveEmptyEntries) // Split by ","
        //                //    .Select(item => item.Trim('\"')) // Remove leading/trailing quotes
        //                //    .ToList();

        //                //// Step 3: Deserialize each item
        //                //var result = individualItems
        //                //    .Select(item => JsonSerializer.Deserialize<FormIdentifier>(item))
        //                //    .Where(deserialized => deserialized != null)
        //                //    .ToList();

        //                // First, clean up the escaped JSON string
        //                // Step 1: Clean up the string by removing escape characters
        //                var cleanedInput = _overrideChannels.Replace("\\\"", "\"");

        //                // Step 2: Deserialize the cleaned input to a list of strings
        //                var deserializedList = JsonSerializer.Deserialize<FormIdentifier[]>(_overrideChannels);

        //                // Step 3: Deserialize each string in the list to a ModuleInfo object
        //                //var moduleInfoList = new List<FormIdentifier>();
        //                //foreach (var item in deserializedList)
        //                //{
        //                //    var moduleInfo = JsonSerializer.Deserialize<FormIdentifier>(item);
        //                //    moduleInfoList.Add(moduleInfo);
        //                //}

        //                //var stringArray = JsonSerializer.Deserialize<string[]>(cleanedInput);

        //                // Convert each string item to DataItem object
        //                //var dataItems = JsonSerializer.Deserialize<List<FormIdentifier>>(cleanedInput);

        //            }
        //            catch (JsonException ex)
        //            {
        //                // Handle error without logger (could be a simple console log or a more appropriate mechanism)
        //                Console.WriteLine($"Failed to deserialize OverrideChannels: {ex.Message}");
        //                _parsedOverrideChannels = new List<FormIdentifier>();
        //            }
        //        }
        //        return _parsedOverrideChannels;
        //    }
        //    set
        //    {
        //        // Set the parsed list and serialize it back to the raw string
        //        _parsedOverrideChannels = value;
        //        _overrideChannels = value != null && value.Count > 0
        //            ? JsonSerializer.Serialize(value.Select(x => JsonSerializer.Serialize(x)).ToList())
        //            : null;
        //    }
        //}

        /// <summary>
        ///  messages without which the user should not proceed in any case e.g. OTP
        /// </summary>
        public bool IsTimeSensitive { get; set; }
    }
}
