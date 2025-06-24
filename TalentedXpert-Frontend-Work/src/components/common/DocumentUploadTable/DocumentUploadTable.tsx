import { Icon } from '@iconify/react/dist/iconify.js'
import Link from 'next/link'
import React from 'react'

const DocumentUploadTable = ({ documents, handleDeleteFile, type }: any) => {
    return (
        <div>
            <div className='mb-3'>
                <div className='table-responsive'>
                    {documents?.length > 0 && <table className="table table-dark table-striped">

                        <thead>
                            <tr className='fs-12 fw-small'>
                                <th scope="col">{type} Name</th>
                                <th scope="col">File</th>
                                <th scope="col">Remove</th>
                            </tr>
                        </thead>

                        <tbody>
                            {documents.map((doc: any, index: number) => (<tr className='fs-12' key={index}>
                                <td>{doc?.key}</td>
                                <td>
                                    <Link href={doc?.fileUrl || ''} target='_blank'>
                                        <Icon icon="bx:file" className='ms-2' />
                                    </Link>
                                </td>
                                <td><Icon icon="material-symbols:delete-outline" className='ms-3' onClick={() => handleDeleteFile(doc?.fileUrl)} /></td>
                            </tr>))}
                            {/* <tr className='fs-12'>
                                                    <td>my web dev courses</td>
                                                    <td><Icon icon="bx:file" className='ms-2' /></td>
                                                    <td><Icon icon="material-symbols:delete-outline" className='ms-3' /></td>
                                                </tr>
                                                <tr className='fs-12'>
                                                    <td>my web dev courses</td>
                                                    <td><Icon icon="bx:file" className='ms-2' /></td>
                                                    <td><Icon icon="material-symbols:delete-outline" className='ms-3' /></td>
                                                </tr> */}
                        </tbody>

                    </table>}

                </div>
            </div>
        </div>
    )
}

export default DocumentUploadTable
