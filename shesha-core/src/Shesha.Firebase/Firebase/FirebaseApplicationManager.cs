using System.IO;
using System.Threading.Tasks;
using Abp.Dependency;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Shesha.Services;
using Shesha.Utilities;

namespace Shesha.Firebase
{
    /// <summary>
    /// Firebase application manager. Provides basic functions (e.g. get application instance, configure)
    /// </summary>
    public class FirebaseApplicationManager: IFirebaseApplicationManager, ISingletonDependency
    {
        private const string ServiceAccountJsonFileId = "7941E4BA-0BEB-497B-AD44-DBFFA55C9D7F";
        private const string ServiceAccountJsonFileName = "serviceAccountKey.json";

        private static readonly object _applicationLock = new object();
        private readonly IStoredFileService _fileService;

        public FirebaseApplicationManager(IStoredFileService fileService)
        {
            _fileService = fileService;
        }

        /// <summary>
        /// Update ServiceAccountJson file
        /// </summary>
        public async Task UpdateServiceAccountJson(Stream stream)
        {
            var fileId = ServiceAccountJsonFileId.ToGuid();

            var file = _fileService.GetOrNull(fileId);
            if (file == null)
            {
                await _fileService.SaveFileAsync(stream, ServiceAccountJsonFileName,
                    f => { f.Id = ServiceAccountJsonFileId.ToGuid(); });
            }
            else
            {
                await _fileService.UpdateFileAsync(file, stream, ServiceAccountJsonFileName);
            }
        }

        /// <summary>
        /// Get content of ServiceAccountJson file
        /// </summary>
        public string GetServiceAccountJson()
        {
            var fileId = ServiceAccountJsonFileId.ToGuid();

            var file = _fileService.GetOrNull(fileId);
            if (file == null)
                return null;

            using (var stream = _fileService.GetStream(file))
            {
                if (stream == null)
                    return null;
                using (var sr = new StreamReader(stream))
                {
                    return sr.ReadToEnd();
                }
            }
        }

        /// <summary>
        /// Get application instance
        /// </summary>
        /// <returns></returns>
        public FirebaseApp GetApplication()
        {
            if (FirebaseApp.DefaultInstance != null)
                return FirebaseApp.DefaultInstance;

            
            lock (_applicationLock)
            {
                if (FirebaseApp.DefaultInstance != null)
                    return FirebaseApp.DefaultInstance;

                var json = GetServiceAccountJson();
                var credential = GoogleCredential.FromJson(json);
                
                var app = FirebaseApp.Create(new AppOptions()
                {
                    Credential = credential
                });
            }

            return FirebaseApp.DefaultInstance;
        }
    }
}
