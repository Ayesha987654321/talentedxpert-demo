'use client'
import apiCall from '@/services/apiCall/apiCall';
import { requests } from '@/services/requests/requests';
import { RootState, useAppDispatch } from '@/store/Store';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';

const MsgNotifier = ({ senderProfileId, receiverProfileId, text, taskId }: any) => {
  const dispatch = useAppDispatch();
  const router = useRouter()
  const user = useSelector((state: RootState) => state.user)
  const [threadId, setThreadId] = useState<any>({})

  useEffect(() => {
    getMessageThread();
  }, [])

  useEffect(() => {
    handleSend();
  }, [threadId])

  const getMessageThread = async () => {
    try {
      const response = await apiCall(requests.getThread, {}, 'get', false, dispatch, user, router);
      if (!response?.data?.threads?.some((thread: { expertProfileId: number }) => thread.expertProfileId === Number(receiverProfileId))) {
        let data = {
          'taskId': Number(taskId),
          'expertProfileId': Number(receiverProfileId)
        }
        const res = await apiCall(requests.createThread, data, 'post', false, dispatch, user, router);
        setThreadId(response?.data?.threads[0]?.id || {});
      }
      else {
      }
      setThreadId(response?.data?.threads[0]?.id || {});
    } catch (error) {
      console.warn('Error fetching tasks:', error);
    }
  }

  const handleSend = async () => {
    const data = {
      "senderProfileId": Number(senderProfileId),
      "receiverProfileId": Number(receiverProfileId),
      "text": String(text),
      "threadId": Number(threadId)
    };
    try {
      await apiCall(requests.sendMsg, data, 'post', true, dispatch, user, router);
    } catch (error) {
      console.warn("Error sending message", error);
    }
  };
  return null;
}

export default MsgNotifier
