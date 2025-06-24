'use client'
import { useNavigation } from '@/hooks/useNavigation';
import { TaskStatusTE, TaskStatusTR } from '@/services/enums/enums';
import { RootState } from '@/store/Store';
import { Icon } from '@iconify/react/dist/iconify.js';
import Link from 'next/link';
import React, { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';

const TopMenu: FC<{ setStatus: (status: string) => void }> = ({ setStatus }) => {
  const { navigate } = useNavigation()

  const user = useSelector((state: RootState) => state.user);
  const taskStatuses = user?.profile[0]?.type === 'TR' ? TaskStatusTR : user?.profile[0]?.type === 'TE' ? TaskStatusTE : { '': 'All Tasks' };

  const firstStatusKey = Object.keys(taskStatuses)[0];

  useEffect(() => {
    if (firstStatusKey) {
      setStatus(firstStatusKey);
    }
  }, [firstStatusKey, setStatus, user?.profile?.type]);

  return (
    <div className="mx-3 d-lg-flex justify-content-between">
      <ul className="nav nav-pills mt-3" id="pills-tab" role="tablist">
        {Object.entries(taskStatuses).map(([key, value]) => (
          <li className="nav-item" role="presentation" key={key}>
            <button
              className={`nav-link ${key === firstStatusKey ? 'active' : ''}`}
              id={`pills-${key}-tab`}
              data-bs-toggle="pill"
              data-bs-target={`#pills-${key}`}
              type="button"
              role="tab"
              aria-controls={`pills-${key}`}
              aria-selected={key === firstStatusKey}
              onClick={() => setStatus(key)}
            >
              {value}
            </button>
          </li>
        ))}
      </ul>
      {user?.profile?.length > 0 && user?.profile[0]?.type === 'TR' && (
        <Link className="card-right-heading bg-info text-white d-flex justify-content-between ad-new" href="/dashboard/tasks/add" onClick={() => navigate("/dashboard/tasks/add")}>
          <span className="me-3">Add New Task</span>
          <Icon icon="line-md:plus-square-filled" className="text-dark" width={32} height={32} />
        </Link>
      )}
    </div>
  );
};

export default TopMenu;
