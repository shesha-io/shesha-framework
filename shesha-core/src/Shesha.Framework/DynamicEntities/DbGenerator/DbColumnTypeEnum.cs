namespace Shesha.DynamicEntities.DbGenerator
{
    // ToDo: AS - add geometry type
    public enum DbColumnTypeEnum
    {
        Guid = 1,
        String = 2,
        Float = 3,
        Double = 4,
        Int32 = 5,
        Int64 = 6,
        Decimal = 7,
        Date = 8,
        Time = 9,
        DateTime = 10,
        EntityReference = 11,
        GenericEntityReference = 12,
        ReferenceListItem = 13,
        Boolean = 14,
        Json = 15,
    }
}
