import React, { FC, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import ModalWrapper from '../ModalWrapper/ModalWrapper';
import apiCall from '@/services/apiCall/apiCall';
import { useRouter } from 'next/navigation';
import { RootState, useAppDispatch } from '@/store/Store';
import { useSelector } from 'react-redux';
import { requests } from '@/services/requests/requests';
import { inviteTeamSchema } from '@/schemas/inviteTeamSchema/inviteTeamSchema';
import { z } from 'zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dataForServer } from '@/models/inviteTeamModel/inviteTeamModel';
import { toast } from 'react-toastify';
import CreatableSelect from 'react-select/creatable';

// Define types for search query and user
interface SearchQuery {
    name: string;
    jobTitle: string;
    categoryId: string | number; // Allow number for category ID
    city: string | number; // Allow number for city ID
    email: string;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle?: string;
    categoryId?: string;
    city?: string;
    profile: { id: string }[];
}

type FormSchemaType = z.infer<typeof inviteTeamSchema>;

const InviteMemberModal: FC<{ isOpen: boolean; onClose: () => void; data: { id: string; name: string } }> = ({
    isOpen,
    onClose,
    data,
}) => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const closeRef = useRef(null);

    // Search query state
    const [searchQuery, setSearchQuery] = useState<SearchQuery>({
        name: '',
        jobTitle: '',
        categoryId: '',
        city: '',
        email: '',
    });
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [error, setError] = useState<string>('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [cityInput, setCityInput] = useState<string>('');

    const user = useSelector((state: RootState) => state.user);
    const router = useRouter();
    const dispatch = useAppDispatch();

    useEffect(() => {
        setOpenModal(isOpen);
    }, [isOpen]);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await apiCall(
                    `${requests.getCategory}?level=1`,
                    {},
                    'get',
                    false,
                    dispatch,
                    user,
                    router
                );
                if (res?.data?.data?.categories) {
                    setCategories(res.data.data.categories);
                }
            } catch (err) {
                console.warn(err);
                setError('Failed to fetch categories.');
            }
        };
        fetchCategories();
    }, [dispatch, user, router]);

    // Fetch cities based on input
    const fetchCities = async (input: string) => {
        if (!input.trim()) {
            setCities([]);
            return;
        }
        try {
            const res = await apiCall(
                `${requests.cities}?name=${encodeURIComponent(input)}`,
                {},
                'get',
                false,
                dispatch,
                user,
                router
            );
            if (res?.data) {
                setCities(res.data);
            } else {
                setCities([]);
            }
        } catch (err) {
            console.warn(err);
            setCities([]);
        }
    };

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormSchemaType>({
        defaultValues: {
            teamId: data?.id?.toString() || '',
            memberProfileId: '',
        },
        resolver: zodResolver(inviteTeamSchema),
        mode: 'all',
    });

    const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
        const formData = dataForServer(data);
        try {
            const res = await apiCall(
                `${requests.inviteMember}`,
                formData,
                'post',
                true,
                dispatch,
                user,
                router
            );
            if (res?.error) {
                const message = res?.error?.message;
                if (Array.isArray(message)) {
                    message.forEach((msg: string) => toast.error(msg || 'Something went wrong'));
                } else {
                    toast.error(message || 'Something went wrong');
                }
            } else {
                toast.success(res?.data?.message);
                handleClose();
            }
        } catch (err) {
            console.warn(err);
            toast.error('Failed to send invite');
        }
    };

    const fetchUsers = async () => {
        // Validate email format if provided
        if (searchQuery.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchQuery.email)) {
            setError('Invalid email format');
            return;
        }
        // Require at least one search field
        const hasQuery = Object.values(searchQuery).some((value) => String(value).trim() !== '');
        if (!hasQuery) {
            setError('Please enter at least one search criterion.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            // Construct query parameters
            const query = new URLSearchParams();
            Object.entries(searchQuery).forEach(([key, value]) => {
                if (String(value).trim()) {
                    query.append(key, String(value).trim());
                }
            });
            const response = await apiCall(
                `${requests.connectedAccount}?${query.toString()}`,
                {},
                'get',
                false,
                dispatch,
                user,
                router
            );
            if (response?.error) {
                setError(response?.error?.message || 'Failed to fetch users');
                console.log('err')
                setFilteredUsers([]);
                setSearchQuery({
                    name: '',
                    jobTitle: '',
                    categoryId: '',
                    city: '',
                    email: ''
                })
            } else {
                const users = response?.data?.data?.users
                    ? response?.data?.data?.users
                    : [response?.data?.data?.users].filter(Boolean);
                const validUsers = users.filter((u: User) => u.id !== user?.id);
                setFilteredUsers(validUsers);
                if (validUsers.length === 0 && users.length > 0) {
                    setError('You cannot invite yourself.');
                }
            }
        } catch (err) {
            console.warn(err);
            setError('Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSearchQuery((prev) => ({ ...prev, [name]: value }));
        setError('');
        if (name === 'city') {
            setCityInput(value);
            fetchCities(value);
        }
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSearchQuery((prev) => ({ ...prev, categoryId: value }));
        setError('');
    };

    const handleCitySelect = (selectedOption: any) => {
        const value = selectedOption ? selectedOption.value : '';
        setSearchQuery((prev) => ({ ...prev, cityId: value }));
        setCityInput(selectedOption ? selectedOption.label : '');
        setError('');
    };

    const handleUserClick = (user: User) => {
        setSelectedUsers([user]); // Single selection
        setValue('memberProfileId', user?.profile?.[0]?.id?.toString() || '');
        setFilteredUsers([]);
        setSearchQuery({
            name: '',
            jobTitle: '',
            categoryId: '',
            city: '',
            email: '',
        });
        setCityInput('');
    };

    const handleRemoveUser = (userId: string) => {
        setSelectedUsers([]);
        setValue('memberProfileId', '');
    };

    const handleClose = () => {
        setOpenModal(false);
        setSearchQuery({
            name: '',
            jobTitle: '',
            categoryId: '',
            city: '',
            email: '',
        });
        setCityInput('');
        setSelectedUsers([]);
        setFilteredUsers([]);
        setError('');
        onClose();
    };

    return (
        <>
            {openModal && (
                <div className="ad-review">
                    <ModalWrapper
                        modalId="InviteMemberModal"
                        title="Add New Member"
                        closeRef={closeRef}
                        handleClose={handleClose}
                    >
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-3">
                                <h6 className="form-label">Search Users:</h6>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label htmlFor="name" className="form-label">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            className="form-control"
                                            placeholder="Enter Name"
                                            value={searchQuery.name}
                                            onChange={handleSearchChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="email" className="form-label">
                                            Email
                                        </label>
                                        <input
                                            type="text"
                                            id="email"
                                            name="email"
                                            className="form-control"
                                            placeholder="Enter Email"
                                            value={searchQuery.email}
                                            onChange={handleSearchChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="jobTitle" className="form-label">
                                            Job Title
                                        </label>
                                        <input
                                            type="text"
                                            id="jobTitle"
                                            name="jobTitle"
                                            className="form-control"
                                            placeholder="Enter Job Title"
                                            value={searchQuery.jobTitle}
                                            onChange={handleSearchChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="categoryId" className="form-label">
                                            Category
                                        </label>
                                        <select
                                            id="categoryId"
                                            name="categoryId"
                                            className="form-select"
                                            value={searchQuery.categoryId}
                                            onChange={handleCategoryChange}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="city" className="form-label">
                                            City
                                        </label>
                                        <CreatableSelect
                                            isClearable
                                            options={cities.map((city) => ({
                                                value: city.id,
                                                label: city.name,
                                            }))}
                                            value={
                                                cityInput
                                                    ? { value: searchQuery.city, label: cityInput }
                                                    : null
                                            }
                                            onInputChange={(input) => {
                                                setCityInput(input);
                                                fetchCities(input);
                                            }}
                                            onChange={handleCitySelect}
                                            placeholder="Type to search city"
                                            className="invert text-dark"
                                        />
                                    </div>
                                </div>
                                {error && <div className="text-danger pt-2">{error}</div>}
                                <div className="text-end mt-3">
                                    <button
                                        type="button"
                                        className="btn btn-info btn-sm rounded-pill"
                                        onClick={fetchUsers}
                                        disabled={loading}
                                    >
                                        {loading ? 'Searching...' : 'Search'}
                                    </button>
                                </div>
                            </div>

                            {/* Search Results */}
                            {filteredUsers.length > 0 && (
                                <div className="mb-3">
                                    <h6>Search Results</h6>
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Select</th>
                                                    <th scope="col">Name</th>
                                                    <th scope="col">Email</th>
                                                    <th scope="col">Job Title</th>
                                                    <th scope="col">Category</th>
                                                    <th scope="col">City</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredUsers.map((user) => (
                                                    <tr key={user.id}>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                checked={selectedUsers.some((u) => u.id === user.id)}
                                                                onChange={() => handleUserClick(user)}
                                                            />
                                                        </td>
                                                        <td>{`${user.firstName} ${user.lastName}`}</td>
                                                        <td>{user.email}</td>
                                                        <td>{user.jobTitle || '-'}</td>
                                                        <td>
                                                            {categories.find((cat) => cat.id === user.categoryId)?.name || '-'}
                                                        </td>
                                                        <td>{user.city || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Selected Users */}
                            {selectedUsers.length > 0 && (
                                <div className="mb-5">
                                    <h6>Selected Users</h6>
                                    <div className="table-responsive">
                                        <table className="table table-dark table-striped">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Name</th>
                                                    <th scope="col">Email</th>
                                                    <th scope="col">Job Title</th>
                                                    <th scope="col">Category</th>
                                                    <th scope="col">City</th>
                                                    <th scope="col">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedUsers.map((user) => (
                                                    <tr key={user.id}>
                                                        <td>{`${user.firstName} ${user.lastName}`}</td>
                                                        <td>{user.email}</td>
                                                        <td>{user.jobTitle || '-'}</td>
                                                        <td>
                                                            {categories.find((cat) => cat.id === user.categoryId)?.name || '-'}
                                                        </td>
                                                        <td>{user.city || '-'}</td>
                                                        <td>
                                                            <Icon
                                                                icon="material-symbols:delete-outline"
                                                                className="cursor-pointer"
                                                                onClick={() => handleRemoveUser(user.id)}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {errors.memberProfileId && (
                                        <div className="text-danger pt-2">{errors.memberProfileId.message}</div>
                                    )}
                                </div>
                            )}
                            <div className="text-end">
                                <button
                                    type="button"
                                    className="btn btn-outline-info btn-sm rounded-pill me-2"
                                    onClick={handleClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-info btn-sm rounded-pill"
                                    disabled={selectedUsers.length === 0}
                                >
                                    Send Invite
                                </button>
                            </div>
                        </form>
                    </ModalWrapper>
                </div>
            )}
        </>
    );
};

export default InviteMemberModal;
