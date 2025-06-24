export const dataForServer = (values:any) => {

    return {
        "email" : values?.email,
        "password" : values?.password,
        "loginAs" : values?.loginAs,
        "rememberMe" : values?.rememberMe,
    }


}