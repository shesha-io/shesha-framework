namespace Shesha.Configuration.Runtime
{
    /// <summary>
    /// General data type
    /// </summary>
    // todo: move to the core part or replace with the standard enum from .Net is any
    public enum GeneralDataType
    {
        Guid = 0,
        Text = 1,
        Date = 2,
        Time = 3,
        DateTime = 4,
        Boolean = 5,
        Numeric = 6,
        Enum = 7,
        ReferenceList = 8,
        MultiValueReferenceList = 9,
        EntityReference = 10,
        StoredFile = 11,
        List = 12
    }
}
