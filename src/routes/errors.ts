export interface RouteError {
    code: number
    message: string
}

export const tokenFail = {
    code: 401,
    message: "You've provided an expired or invalid token. Please verify and try again."
}

export const bodyFail = {
    code: 400,
    message: "You've provided invalid body data. Please make sure it is valid json, and verify it has a correct property."
}

export const usernameTaken = {
    code: 409,
    message: "You've provided a username that conflicts with an existing one. Please try a different one."
}

export const noUsername = {
    code: 401,
    message: "You've provided a username that doesn't exist. Please verify your login information."
}

export const invalidPassword = {
    code: 401,
    message: "You've provided an invalid password for this account. Please verify your login information."
}

export const loginFail = {
    code: 401,
    message: "Username or password are not specified, Please verify your login information."
}

export const extensionFail = {
    code: 409,
    message: "You must provide a vile extension for your upload."
}