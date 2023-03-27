namespace Shesha.Domain
{
    /// <summary>
    /// Implement this interface for an entity which may optionally have FrontEndApplication.
    /// </summary>
    public interface IMayHaveFrontEndApplication
    {
        /// <summary>
        /// Front-end application
        /// </summary>
        FrontEndApp Application { get; set; }
    }
}
