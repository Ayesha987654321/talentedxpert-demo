export const dataForServer = (values: any) => {

    return {
        "rating": Number(values?.rating)||null,
        "comments": values?.comments,
        "taskId":Number(values?.taskId)||null ,
        "reviewerProfileId":Number( values?.reviewerProfileId )|| 0,
        "revieweeProfileId": Number(values?.revieweeProfileId )|| 0

        
    }
}