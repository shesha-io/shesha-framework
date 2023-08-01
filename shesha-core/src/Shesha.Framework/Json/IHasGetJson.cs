namespace Shesha.Json
{
    /// <summary>
    /// Represents an object that uses it's own logic of Json conversion
    /// </summary>
    public interface IHasGetJson
    {
        /// <summary>
        /// Convert object to Json representation
        /// </summary>
        /// <returns></returns>
        string GetJson();
    }
}
