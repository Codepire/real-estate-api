export interface IGenericResult {
    message: string;
    data: any;
}

export interface ILoginResult extends IGenericResult {
    access_token: string;
}
