export const dataForServer = (values: any) => {

    return {
        "taskId": Number(values?.taskId)||null,
        "description": values?.description,
        "expertProfileId": Number(values?.expertProfileId)|| null,
       
    }
}