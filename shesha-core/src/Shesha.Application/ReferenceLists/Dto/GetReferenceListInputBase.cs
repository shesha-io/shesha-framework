namespace Shesha.ReferenceLists.Dto
{
    /// <summary>
    /// Base input that is used to get reference list
    /// </summary>
    public class GetReferenceListInputBase
    {
        /// <summary>
        /// MD5 of the reference list. Is used for the client side caching.
        /// If specified, the application should compare the value received from the client with a local cache and return http response with code 304 (not changed)
        /// </summary>
        public string Md5 { get; set; }
    }
}
