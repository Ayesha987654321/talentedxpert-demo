export const dataForServer = (values:any) => {
    return {
        "name": values.name,
        "description": values?.description || undefined,
        "logoUrl": values?.logoUrl || undefined,
    }

}