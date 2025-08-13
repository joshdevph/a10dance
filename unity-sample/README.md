# Unity Appwrite Authentication Sample

This folder contains a minimal Unity project snippet demonstrating how to use Appwrite for authentication and training module access.

The sample uses the same Appwrite credentials as the web application in this repository:
- Endpoint: `https://syd.cloud.appwrite.io/v1`
- Project ID: `68660b33001284d5ebd6`

## Features
- Email/password sign up and login via Appwrite.
- Role-based access checks using user labels.
- Helpers for logging module access and completion in Appwrite databases.

## Usage
1. Create a new Unity project and copy the contents of the `Assets` folder into your project's `Assets` directory.
2. Add the [Appwrite .NET SDK](https://github.com/appwrite/sdk-for-dotnet) to your Unity project.
3. Attach the provided scripts to your scenes or game objects as needed.
4. Replace database and collection IDs in `ModuleAccessManager.cs` with values from your Appwrite project.

This sample is intended as a starting point for the full training module authentication system.
