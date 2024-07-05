
type apiRoutes =
    | "workshop"
    | "info"
    | "user"
    | "users"
    | "account"
    | "upload"
    ;

export type v1Prefix = `/v1/${apiRoutes}`