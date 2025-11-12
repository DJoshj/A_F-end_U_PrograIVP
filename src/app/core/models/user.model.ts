export interface User {
    username: string;
    password?: string; // Password might not be returned by API, or only on creation
    email: string;
    state: string;
    creationDate: string;
    updateDate: string;
}
