import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useGetUserByIdQuery } from "../redux/apis/user.api";

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userId, setUserId] = useState("")
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  const { data } = useGetUserByIdQuery(userId || "", {
    skip: !userId
  })

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const { user } = useSelector<RootState, any>(state => state.auth)

  useEffect(() => {
    if (user) {
      setUserId(user._id)
    }
  }, [userId])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleMediaQueryChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsSidebarOpen(e.matches);
    };

    handleMediaQueryChange(mediaQuery);
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  useEffect(() => {
    const updateStatus = () => {
      if (!navigator.onLine) {
        setIsOffline(true);
        setShowOnlineMessage(false);
      } else {
        setIsOffline(false);
        setShowOnlineMessage(true);
        setTimeout(() => setShowOnlineMessage(false), 2000);
      }
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return (
    <>
      <div>
        <div className="w-full">
          <Navbar toggleSidebar={() => setIsSidebarOpen(true)} userData={data} />
        </div>
        <div className="flex s">
          {isSidebarOpen && (
            <>
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleSidebar}></div>
              <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 lg:hidden">
                <Sidebar toggleSidebar={toggleSidebar} userData={data} />
              </div>
            </>
          )}
          <div className={`overflow-y-auto fixed h-full bg-white shadow-lg z-20 hidden lg:block ${isSidebarOpen ? "w-64" : "w-0"}`}>
            <Sidebar toggleSidebar={toggleSidebar} userData={data} />
          </div>
          <div className={`flex-1 pt-28 pb-10 px-4 sm:px-8 transition-all bg-gray-50 duration-300 overflow-y-hidden min-h-screen ${isSidebarOpen ? "ml-0 lg:ml-80" : "ml-0"}`}>
            {
              isOffline && <div id="offline-banner" className={`-mt-6 w-full text-center py-3 flex items-center justify-center`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.93 4.93a10.5 10.5 0 0114.14 0M3.51 9.88a7.5 7.5 0 0116.98 0M1.69 14.76a4.5 4.5 0 0119.62 0M12 20h.01"></path>
                </svg>
                No Internet Connection
              </div>
            }

            {showOnlineMessage && (
              <div className="text-green-600 -mt-6 w-full py-3 flex items-center justify-center">
                You're back online!
              </div>
            )}
            <Outlet />
          </div>
        </div>
      </div>

    </>
  );
};

export default Layout;
