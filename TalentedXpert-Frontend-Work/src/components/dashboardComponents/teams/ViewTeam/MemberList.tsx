import apiCall from '@/services/apiCall/apiCall'
import { requests } from '@/services/requests/requests'
import { RootState, useAppDispatch } from '@/store/Store'
import { useRouter } from 'next/navigation'
import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

const MemberList: FC<any> = ({ data, type, getTeam, id }) => {
    const user = useSelector((state: RootState) => state.user)
    const dispatch = useAppDispatch()
    const router = useRouter()

    const handleReinvite = async (item: any) => {
        if (item?.invitationCount >= 3) {
            toast.warn('You have reached the maximum number of invitations!');
            return;
        }
        await apiCall(requests.invitation + '/' + item?.id, { invitationCount: Number(item?.invitationCount) + 1, invitationStatus: item?.invitationStatus }, 'put', false, dispatch, user, router).then((res: any) => {
            if (res.error) {
                toast.error(res?.error?.message[0])
            }
            else {
                toast.success('Invitation sent successfully')
                getTeam(Number(id))
            }
        }).catch(err => console.warn(err))
    }

    return (
        <div className='table-responsive mb-3'>
            <table className="table table-dark table-striped">
                <thead>
                    <tr>
                        <th scope="col">Member Name</th>
                        {type === 'invited' && <th scope="col">Status</th>}
                        <th>Role</th>
                        {type === 'invited' && <th>Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {data?.map((item: any) => {
                        return (
                            <tr key={item?.id}>
                                <td>{item?.profile?.user?.firstName} {item?.profile?.user?.lastName}</td>
                                {type === 'invited' && <td>{item?.invitationStatus}</td>}
                                <td>{item?.profile?.user?.title || '-'}</td>
                                {type === 'invited' &&
                                    <td>
                                        <button onClick={() => handleReinvite(item)} className='btn btn-info py-1' >Re-invite</button>
                                    </td>
                                }
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default MemberList