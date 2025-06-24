export const dataForServer = (values:any) => {
    return {
        "teamId": Number(values.teamId),
        "memberProfileId": Number(values?.memberProfileId),
    }

}