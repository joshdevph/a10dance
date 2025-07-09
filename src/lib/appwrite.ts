import { Client, Account, Databases } from 'appwrite';

export const appwrite = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1') // or your endpoint
    .setProject('68660b33001284d5ebd6'); // Replace with your project ID

export const account = new Account(appwrite);
export const databases = new Databases(appwrite);