export const dataForServer = (values: any) => {

    return {
     
        "startTime": values?.startTime || null,
        "endTime": values?.endTime || null,
        "duration": values?.duration || 0,
        "comment": values?.comment || '',
        "TEProfileId": values?.TEProfileId || null,
        "taskId": values?.taskId || null,
        "amount": values?.amount || 0,
        "date": values?.date || null,
        'attachment': values?.documents|| null


    }
}