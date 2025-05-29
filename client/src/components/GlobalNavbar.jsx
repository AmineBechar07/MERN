import { Popover } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { Link, useNavigate } from 'react-router-dom';

export default function GlobalNavbar({ onSave, isSubmissionEnabled, onSubmitClick }) {
  const navigate = useNavigate();
  return (
    <Popover as="header" className="sticky top-0 z-50 bg-white shadow-sm lg:overflow-y-visible">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between lg:gap-8 xl:grid xl:grid-cols-12">
          <div className="flex md:absolute md:inset-y-0 md:left-0 lg:static xl:col-span-2">
            <div className="flex flex-shrink-0 items-center">
              <Link to="/home">
                <img
                  className="block h-12 w-auto"
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF9FjUzdW5exwb9-VKsHXjHAxVZQnoZehDyvB9euURu-h0YdsIeefnwcQhLyFxiy8P3Bs&usqp=CAU"
                  alt="University of Sharjah"
                />
              </Link>
            </div>
          </div>
            <div className="min-w-0 flex-1 md:px-8 lg:px-0 xl:col-span-6">
              <div className="flex items-center px-6 py-4 md:mx-auto md:max-w-3xl lg:mx-0 lg:max-w-none xl:px-0">
                <div className="w-full">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-rose-500 focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-rose-500 sm:text-sm"
                      placeholder="Recherche (Bientôt disponible)"
                      type="search"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          <div className="hidden lg:flex lg:items-center lg:justify-end xl:col-span-4">
            <button 
              onClick={() => {
                window.location.reload();
              }}
              className="text-sm font-medium text-gray-900 hover:underline cursor-pointer"
            >
              Déconnecter
            </button>
            <a
              href="#"
              className="ml-5 flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </a>

              
            <button
              onClick={() => {
                const currentPath = window.location.pathname;
                if (currentPath.startsWith('/evaluation/split-screen')) {
                  navigate('/evaluation-type');
                } else if (currentPath.startsWith('/evaluation-type')) {
                  navigate('/home');
                } else {
                  navigate('/home');
                }
              }}
              className="ml-6 inline-flex items-center rounded-md border border-transparent bg-gray-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Retour
            </button>
            <button
                type="button" // Prevents default form submission behavior
                onClick={() => {
                  if (onSubmitClick && isSubmissionEnabled) {
                    onSubmitClick();
                  } else if (onSave && !onSubmitClick) { // Only trigger onSave if onSubmitClick is not defined
                    onSave().then(() => {
                      navigate('/validate-modal');
                    });
                  }
                }}
                disabled={
                  window.location.pathname.startsWith('/evaluation-type') ||
                  (onSubmitClick !== undefined 
                    ? !isSubmissionEnabled  // If onSubmitClick is present, disable based on isSubmissionEnabled
                    : (onSave ? false : true)) // Fallback: if only onSave, enable; else (neither), disable.
                }
                className={`ml-2 inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm 
                  ${window.location.pathname.startsWith('/evaluation-type') || 
                    (onSubmitClick !== undefined 
                      ? !isSubmissionEnabled 
                      : !onSave)
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
              >
                Soumettre
              </button>
          </div>
        </div>
      </div>
    </Popover>
  )
}
