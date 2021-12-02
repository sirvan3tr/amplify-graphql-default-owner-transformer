interface Indexable {
    [key: string]: any;
}
export declare class TypeValidators implements Indexable {
    [key: string]: any;
    ID: (x: string) => boolean;
    String: (x: string) => boolean;
    Int: (x: string) => boolean;
    Float: (x: string) => boolean;
    Boolean: (x: string) => boolean;
    AWSJSON: (x: string) => boolean;
    AWSDate: (x: string) => boolean;
    AWSTime: (x: string) => boolean;
    AWSDateTime: (x: string) => boolean;
    AWSTimestamp: (x: string) => boolean;
    AWSEmail: (x: string) => boolean;
    AWSURL: (x: string) => boolean;
    AWSPhone: (x: string) => any;
    AWSIPAddress: (x: string) => boolean;
}
export {};
//# sourceMappingURL=validators.d.ts.map