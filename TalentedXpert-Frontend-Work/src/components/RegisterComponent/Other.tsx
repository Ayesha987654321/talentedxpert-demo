'use client';
import apiCall from '@/services/apiCall/apiCall';
import { requests } from '@/services/requests/requests';
import { useAppDispatch } from '@/store/Store';
import React, { useEffect, useState } from 'react'
import CreatableSelect from 'react-select/creatable';
import GlobalLoader from '../common/GlobalLoader/GlobalLoader';
import dynamic from 'next/dynamic';
import { editProfileSchema } from '@/schemas/editProfile-schema/editProfileSchema';
const QuillEditor = dynamic(() => import('@/components/common/TextEditor/TextEditor'), { ssr: false });

const Other: React.FC<any> = ({ register, errors, watch, Controller, control, setValue, setError, clearErrors }) => {
  const isOrganization = watch("userType") === 'ORGANIZATION' ? true : false;

  const isDisabledChecked = watch("isDisabled");
  const [skills, setSkills] = useState<any[]>([])
  const [wordCount, setWordCount] = useState(0);
  const [editorTxt, setEditorTxt] = useState('');

  const [loading, setLoading] = useState<boolean>(false)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if(watch('about')){
      setEditorTxt(watch('about'))
    }
    getAllSkills(null)
  }, [])

  useEffect(()=>{
    setValue('about', editorTxt)
  }, [editorTxt])

  const getAllSkills = async (name: any) => {
    const response = await apiCall(requests.getSkills, {}, 'get', false, dispatch, null, null)
    if (name?.length > 0) {
      const filteredSkills = response?.data?.data?.skills?.filter((skill: any) =>
        name.includes(skill.name)
      )
      setValue('skills', filteredSkills?.map((skill: any) => ({
        label: skill.name,
        value: skill.id,
      })) || [])
    }
    setSkills(response?.data?.data?.skills?.map((skill: any) => ({
      label: skill.name,
      value: skill.id,
    })) || [])
  }

  const addSkills = async (name: string[]) => {
    const param = {
      names: name
    }
    const response = await apiCall(requests.getSkills, param, 'post', false, dispatch, null, null)
    if (response?.data?.data) {
      await getAllSkills(name)
    }
  }

  const handleGenerateAI = async () => {
    setLoading(true)
    if (watch('title') === '') {
      setError('title', { message: "Please Enter the Title" })
      setLoading(false)
      return;
    }

    if (watch('title') !== '') {
      const response = await apiCall(requests.createBio, { prompt: `${watch('title')}` }, 'post', false, dispatch, null, null)
      if (response?.data) {
        if (response?.data?.coreSkills?.length > 0) {
          await addSkills(response?.data?.coreSkills)
          clearErrors('skills')
        }
        if (response?.data?.professionalBio) {
          let words = response?.data?.professionalBio.trim().split(/\s+/).filter((word: any) => word.length > 0);
          if (words.length > 500) {
            words = words.slice(0, 500);
          }
          setWordCount(words.length);
          setEditorTxt(response?.data?.professionalBio || '')
          clearErrors('about')

          setValue('about', response?.data?.professionalBio || '')
        }
        clearErrors('title');
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    if (editorTxt) {
      setValue('about', editorTxt)
    }
  }, [editorTxt])

  const handleEditorTxt = (value: any) => {
    setEditorTxt(value.replace(/<[^>]*>/g, '').trim() !== '' ? value : '')

    let words = value.trim().split(/\s+/).filter((word: any) => word.length > 0);
    if (words.length > 500) {
      words = words.slice(0, 500);
    }
    setWordCount(words.length);
  }

  return (
    <div>
      <div className='row'>
        <div className="mb-3">
          <label htmlFor="firstName" className="form-label">Profile Title <span style={{ color: 'red' }}>*</span></label>
          <input {...register("title")} type="text" className="form-control bg-dark" placeholder="Title" name="title" />
          {
            errors.title && (
              <div className="text-danger pt-2">{errors.title.message}</div>
            )
          }
        </div>
        <div className='col-md-6'>
          <div className="mb-3">
            <label htmlFor="about" className="form-label">About  <span style={{ color: 'red' }}>*</span></label>
            <QuillEditor className=" bg-white text-white invert border-0" style={{ height: '150px' }} placeholder="About" value={editorTxt} setValue={handleEditorTxt} />
            {/* <textarea {...register("about")} type="text" className="form-control bg-dark" id="about" onChange={handleInputChange} rows={3} placeholder="About"></textarea> */}
            <div className='d-flex justify-content-between align-items-center mt-1 mb-3'>
              <p className="text-dark">{wordCount}/200 words</p>
              <p className='btn text-info btn-sm rounded-pill p-0' onClick={handleGenerateAI}>Generate through AI</p>
            </div>
            {
              errors?.about && (
                <div className="text-danger pb-2">{errors?.about?.message}</div>
              )
            }

          </div>
        </div>
       {watch('profileType') ==='TE' && <div className='col-md-6'>
          <div className="mb-3">
            <label htmlFor="skills" className="form-label">Skills  <span style={{ color: 'red' }}>*</span></label>
            <Controller
              name="skills"
              control={control}
              render={({ field }: any) => (
                <CreatableSelect
                  {...field}
                  isMulti
                  options={skills || ''}
                  className="custom-select-container invert"
                  classNamePrefix="custom-select"
                  onChange={(selectedOptions) => {
                    field.onChange(selectedOptions);
                  }}
                />
              )}
            />
            {errors?.skills && (
              <div className="text-danger pb-2">{errors?.skills?.message}</div>
            )
            }
          </div>
        </div>}
        <div className='col-12 my-3 mb-3'>
          {/* <div className='d-flex my-3'>
            <label className='text-dark fs-16 me-2'>Would you like to promote your Talented Xpert profile?</label>
            <div className='d-flex align-items-center  '>

              <div className="form-check me-3">
                <label className="form-check-label text-dark fs-16" htmlFor="isPromoted">
                  <input {...register('isPromoted')} className="form-check-input " type="radio" value={'true'} name="isPromoted" id="isPromoted"
                  />
                  Yes
                </label>
              </div>
              <div className="form-check me-3">
                <label className="form-check-label text-dark fs-16" htmlFor="isPromoted">
                  <input {...register('isPromoted')} className="form-check-input text-dark  " type="radio" value={'false'} name="isPromoted" id="isPromoted"
                  />
                  No
                </label>
              </div>
            </div>
          </div> */}

          {/* {!isOrganization && <div className="form-check mb-3">
            <input {...register("isDisabled")} className="form-check-input bg-transparent border-dark" type="checkbox" value="" id="isDisabled" />
            <label className="form-check-label fw-medium" htmlFor="isDisabled">
              I declare that I am a person with disability
            </label>
          </div>} */}
        </div>
        {/* {isDisabledChecked && (
          <div className='col-md-6'>
            <div className="mb-3">
              <label htmlFor="disabilityDetail" className="form-label">Disability Detail </label>
              <input
                {...register("disabilityDetail")}
                type="text"
                className="form-control bg-dark"
                id="disabilityDetail"
                placeholder="Disability Detail"
              />
              {errors.disabilityDetail && (
                <div className="text-danger pb-2">{errors.disabilityDetail.message}</div>
              )
              }
            </div>
          </div>
        )} */}


      </div>
      {loading && <GlobalLoader />}
    </div>
  )
}

export default Other
