export const dataForServer = (values: any) => {

    return {
        "details": values?.details,
        "amount": Number(values?.amount),
        'status': values?.status,
        'expertProfileId': Number(values?.expertProfileId),
        'teamId': Number(values?.teamId)|| null,
        'taskId': Number(values?.taskId)||null,
        'answers': values?.answers|| [],
        'documents': values?.documents || [],
        'articles': values?.articles || []
    }


}