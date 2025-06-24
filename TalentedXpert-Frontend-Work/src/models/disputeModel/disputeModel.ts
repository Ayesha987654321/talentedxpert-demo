export const dataForServer = (values: any) => {

    return {
        "taskId": Number(values?.taskId)||null,
        "description": values?.description,
        "status": "INITIALIZED",
        "documents": values?.documents || []
    }
}