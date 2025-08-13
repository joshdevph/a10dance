using Appwrite;

namespace UnityAuthSample
{
    public static class AppwriteConfig
    {
        public const string Endpoint = "https://syd.cloud.appwrite.io/v1";
        public const string ProjectId = "68660b33001284d5ebd6";

        public static Client CreateClient()
        {
            return new Client()
                .SetEndpoint(Endpoint)
                .SetProject(ProjectId);
        }
    }
}
