export const dataForServer = (values: any) => {

    return {
        "description": values?.description || '',
        "title": values?.title || '',
        "profileId": Number(values?.profileId)||null,
        "documents": values?.documents || [],
        "image": values?.image || []
    }
}