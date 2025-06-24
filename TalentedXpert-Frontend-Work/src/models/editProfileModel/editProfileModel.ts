export const dataForServer = (values: any) => {
  const isIndividual = values?.userType === "INDIVIDUAL";

  return {
    firstName: values?.firstName,
    lastName: values?.lastName,
    skills: values?.skills?.map((skill: any) => skill?.value) || [],
    email: values?.email,
    title: values?.title,
    password: values?.password || undefined,
    profileType: values?.profileType,
    mobile: values?.mobile,
    about: values?.about,
    disability: values?.disability || false,
    promoted: values?.isPromoted === "true" ? true : values?.isPromoted === "false" ? false : "",
    userType: values?.userType || "INDIVIDUAL",
    profilePicture: values?.profilePicture || {},
    disabilityDetail: values?.disabilityDetail || "",
    roleId: values?.roleId || 3,
    education: values?.education || [],
    educationIdsToDelete: values?.educationIdsToDelete || undefined,
    // experience: values?.experience || [],
    experience: values?.experience?.map((exp: any) => ({
      companyName: exp?.companyName || "",
      role: exp?.role || "",
      startDate: exp?.startDate || new Date().toISOString(), 
      endDate: exp?.isPresent?  null: exp?.endDate || null, 
      description: exp?.description || "",
      isPresent: exp?.isPresent || false,
      id: exp?.id
    })) || [],
    experienceIdsToDelete: values?.experienceIdsToDelete || undefined,
    ...(isIndividual ? {} : { 
      organizationName: values?.organizationName, 
      organizationType: values?.organizationType 
    }),
    address: {
      cityId: Number(values?.city) || null,
      stateId: Number(values?.state) || null,
      zip: values?.zip || "",
      street: values?.street || "",
      countryId: Number(values?.country) || null,
      longitude: Number(values?.longitude) || null,
      latitude: Number(values?.latitude) || null,
      address: values?.address || "",
    }
  };
};
