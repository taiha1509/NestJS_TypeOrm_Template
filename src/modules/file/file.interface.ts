export interface IRegisterFile {
    originalName: string;
    // fileName: string;
    key: string;
    mimeType: string;
    size: number;
    createdBy?: number;
}

export interface IGetPresignedPutURLQuery {
    name: string;
}
