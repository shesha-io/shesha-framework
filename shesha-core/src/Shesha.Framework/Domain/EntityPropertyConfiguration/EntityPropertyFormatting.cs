using Shesha.JsonEntities;

namespace Shesha.Domain.EntityPropertyConfiguration
{
    public class EntityPropertyFormatting : JsonEntity
    {

    }

    public class EntityPropertyNumberFormatting : EntityPropertyFormatting
    {
        public virtual int? NumDecimalPlaces { get; set; }

        public virtual bool? ShowAsPercentage { get; set; }

        public virtual bool? ShowThousandsSeparator { get; set; }

        public virtual string? CustomFormat { get; set; }
    }
}
