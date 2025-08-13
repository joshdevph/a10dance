using System.Threading.Tasks;
using Appwrite;
using Appwrite.Services;
using System.Linq;

namespace UnityAuthSample
{
    public class AuthManager
    {
        private readonly Account account;

        public AuthManager()
        {
            var client = AppwriteConfig.CreateClient();
            account = new Account(client);
        }

        public async Task Signup(string email, string password)
        {
            await account.CreateAsync(userId: ID.Unique(), email: email, password: password);
        }

        public async Task Login(string email, string password)
        {
            await account.CreateEmailSessionAsync(email: email, password: password);
        }

        public async Task Logout()
        {
            await account.DeleteSessionAsync(sessionId: "current");
        }

        public async Task<bool> HasRole(string role)
        {
            var user = await account.GetAsync();
            return user.Labels != null && user.Labels.Contains(role);
        }
    }
}
