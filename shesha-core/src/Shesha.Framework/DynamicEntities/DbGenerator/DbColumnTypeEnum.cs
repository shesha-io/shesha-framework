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
        Date = 7,
        Time = 8,
        DateTime = 9,
        EntityReference = 10,
        GenericEntityReference = 11,
        ReferenceListItem = 12,
        Boolean = 13,
        Json = 14,
    }
}
