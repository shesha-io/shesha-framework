using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.Globalization;

namespace Shesha.DynamicEntities.Json
{
    /// <summary>
    /// Date JSON converter. Converts date without
    /// </summary>
    public class DateConverter: IsoDateTimeConverter
    {
        private const string DefaultDateFormat = "yyyy'-'MM'-'dd";

        public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer) 
        {
            string text;

            if (value is DateTime dateTime)
            {
                if ((DateTimeStyles & DateTimeStyles.AdjustToUniversal) == DateTimeStyles.AdjustToUniversal
                    || (DateTimeStyles & DateTimeStyles.AssumeUniversal) == DateTimeStyles.AssumeUniversal)
                {
                    dateTime = dateTime.ToUniversalTime();
                }

                // if date only

                text = dateTime.ToString(DateTimeFormat ?? DefaultDateFormat, Culture);
            }
            else if (value is DateTimeOffset dateTimeOffset)
            {
                if ((DateTimeStyles & DateTimeStyles.AdjustToUniversal) == DateTimeStyles.AdjustToUniversal
                    || (DateTimeStyles & DateTimeStyles.AssumeUniversal) == DateTimeStyles.AssumeUniversal)
                {
                    dateTimeOffset = dateTimeOffset.ToUniversalTime();
                }

                text = dateTimeOffset.ToString(DateTimeFormat ?? DefaultDateFormat, Culture);
            }
            else
            {
                throw new JsonSerializationException($"Unexpected value when converting date. Expected DateTime or DateTimeOffset, got {value?.GetType().FullName}.");
            }

            writer.WriteValue(text);
        }
    }
}
