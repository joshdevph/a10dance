using System.Threading.Tasks;
using Appwrite;
using Appwrite.Services;

namespace UnityAuthSample
{
    public class ModuleAccessManager
    {
        private readonly Databases databases;
        private const string DatabaseId = "training"; // replace with your database ID
        private const string ProgressCollectionId = "progress"; // replace with your collection IDs
        private const string AccessCollectionId = "accessLogs";

        public ModuleAccessManager()
        {
            var client = AppwriteConfig.CreateClient();
            databases = new Databases(client);
        }

        public async Task LogModuleAccess(string userId, string moduleName)
        {
            await databases.CreateDocumentAsync(
                databaseId: DatabaseId,
                collectionId: AccessCollectionId,
                documentId: ID.Unique(),
                data: new { userId, moduleName }
            );
        }

        public async Task UpdateProgress(string userId, string moduleName, bool completed)
        {
            await databases.CreateDocumentAsync(
                databaseId: DatabaseId,
                collectionId: ProgressCollectionId,
                documentId: ID.Unique(),
                data: new { userId, moduleName, completed }
            );
        }
    }
}
