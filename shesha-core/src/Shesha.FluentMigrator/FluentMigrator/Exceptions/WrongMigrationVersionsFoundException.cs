namespace Shesha.FluentMigrator
{
    /// <summary>
    /// Exception that is used to indicate that there are migration with incorrect version numbers
    /// </summary>
    public class WrongMigrationVersionsFoundException: Exception
    {
        /// <summary>
        /// List of incorrect versions
        /// </summary>
        public List<string> Versions { get; private set; }

        public string CorrectFormat { get; private set; }

        public WrongMigrationVersionsFoundException(string correctFormat, List<string> versions): base($"Found migrations with incorrect version numbers. Correct format of migration version is `{correctFormat}`. Invalid version numbers: {string.Join(',', versions)}")
        {
            CorrectFormat = correctFormat;
            Versions = versions;            
        }
    }
}
