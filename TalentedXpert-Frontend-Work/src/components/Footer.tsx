import React, { useEffect } from "react";
import Image from "next/image";
import { Icon } from '@iconify/react';
import { usePathname } from "next/navigation";
import Link from "next/link";
import ImageFallback from "./common/ImageFallback/ImageFallback";
import { useSelector } from "react-redux";
import { RootState } from "@/store/Store";
import { useNavigation } from "@/hooks/useNavigation";

function Footer() {
  const isAuth = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.user);

  const { navigate } = useNavigation()
  const pathName = usePathname()
  const isView = pathName?.includes('/dashboard') ? false : true

  const redirectUrl = (link: string) => {
    return isAuth ? link : '/signin';
  }

  return (

    <footer className="footer-section">
      <div className="container-fluid">
        <div className={`row bg-dark ${isView ? 'pt-5' : "pt-2"} px-3`}>
          <div className="col-12 text-white">
            <div className="row">

              {isView ? (
                <>
                  <div className="col-md-3  offset-md-1 mb-3 ">
                    <div className="d-flex flex-column d-sm-block justify-content-center ">
                      {/* <ImageFallback
                        src="/assets/images/footer-logo.svg"
                        alt="img"
                        className="img-fluid mb-3"
                        width={200}
                        height={255}
                        priority
                      /> */}
                      <ImageFallback
                        src="/assets/images/footer-logo.svg"
                        fallbackSrc="/assets/images/footer-logo.png"
                        alt="Footer Logo"
                        className="img-fluid mb-3"
                        width={200}
                        height={255}
                        priority
                      />
                      <h6>Call now:(319) 555-0115</h6>
                      <p className="text-white fs-12">
                        6391 Elgin St. Celina, Delaware 10299, New <br />
                        York, United States of America
                      </p>
                    </div>
                  </div>
                  <div className="col-md-3 col-6 col-lg-2">
                    <h6 className="mb-4">Quick Links</h6>
                    <p><Link className="text-white fs-14 footer-text" href={'/about'} onClick={() => navigate('/about')} >About</Link></p>
                    <p><Link className="text-white fs-14 footer-text" href={'/projects'} onClick={() => navigate('/projects')} >Projects</Link></p>
                    <p><Link className="text-white fs-14 footer-text" href={'/blog'} onClick={() => navigate('/about')}>Blog</Link></p>
                    <p><Link className="text-white fs-14 footer-text" href={redirectUrl('/dashboard/disputes')} onClick={() => navigate(isAuth ? '/dashboard/disputes' : '/signin')} >Disputes</Link></p>
                  </div>
                  {(!isAuth || (user?.profile && user?.profile[0]?.type === 'TE')) && <div className="col-md-3 col-6 col-lg-2">
                    <h6 className="mb-4">TalentedXpert</h6>
                    <p><Link className="text-white fs-14 footer-text" href={"/tasks"} onClick={() => navigate('/tasks')}>Tasks</Link></p>
                    <p><Link className="text-white fs-14 footer-text" href={redirectUrl('/dashboard/teams')} onClick={() => navigate(isAuth ? '/dashboard/teams' : '/signin')}>Teams</Link></p>
                    <p><Link className="text-white fs-14 footer-text" href={'/talent-requestors'} onClick={() => navigate('/talent-requestors')}>TalentRequestor</Link></p>
                    <p><Link className="text-white fs-14 footer-text" href={redirectUrl('/dashboard/articles')} onClick={() => navigate(isAuth ? '/dashboard/articles' : '/signin')}>Articles</Link></p>
                    {/* <p><Link className="text-white fs-14 footer-text" href={'/talented-xperts'}>TalentedXpert</Link></p>
                    <p><Link className="text-white fs-14 footer-text" href={'/talented-requesters'}>TalentRequester</Link></p> */}
                  </div>}
                  {(!isAuth || (user?.profile && user?.profile[0]?.type === 'TR')) && <div className="col-md-3 col-6 col-lg-2 offset-0 offset-md-4 offset-lg-0">
                    <h6 className="mb-4">TalentRequestor</h6>

                    <p><Link className="text-white fs-14 footer-text" href={redirectUrl('/dashboard/tasks/add')} onClick={() => navigate(isAuth ? '/dashboard/tasks/add' : '/signin')}>Post a Task</Link></p>
                    <p> <Link className="text-white fs-14 footer-text" href={'/talented-xperts'} onClick={() => navigate('/talented-xperts')}>Browse TalentedXpert</Link></p>

                    <p><Link className="text-white fs-14 footer-text" href={redirectUrl('/dashboard/tasks')} onClick={() => navigate(isAuth ? '/dashboard/tasks' : '/signin')}>TalentRequestor Profile</Link></p>
                    {/* <p><Link className="text-white fs-14 footer-text" href={'#'}>Applications</Link></p> */}
                  </div>}
                  <div className="col-md-3 col-6 col-lg-2">
                    <h6 className="mb-4">Contact</h6>
                    <p><Link className="text-white fs-14 footer-text" href={'/FAQs'} onClick={() => navigate('/FAQs')}>FAQs</Link></p>
                    <p><Link className="text-white fs-14 footer-text" href={'/privacyPolicy'} onClick={() => navigate('/privacyPolicy')}>Privacy Policy</Link></p>
                    <p><Link className="text-white fs-14 footer-text" href={'/termsConditions'} onClick={() => navigate('/termsConditions')}>Terms & Conditions</Link></p>

                  </div>
                  <div className="border-bottom border-grey"></div>
                </>
              ) : null}


              <div className="col-12 ">
                <div className="d-lg-flex d-md-flex d-block justify-content-between pt-2 pe-3 mb-2 text-center ">
                  <p className="text-white fs-14 mb-0">@ {new Date().getFullYear()} TalentedXpert. All Rights Reserved</p>
                  <div onClick={() => navigate('/termsConditions')} className="d-flex d-sm-block justify-content-center mt-1 mt-lg-0 mt-md-0">
                    <Icon icon="ri:facebook-fill" className="me-2" />
                    <Icon icon="iconoir:youtube" className="me-2" />
                    <Icon icon="lets-icons:insta" className="me-2" />
                    <Icon icon="mdi:twitter" className="me-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
