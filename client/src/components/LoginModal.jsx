import React, { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import axios from 'axios'

export default function LoginModal({ open, setOpen, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('https://mern-1-bems.onrender.com/api/login', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setOpen(false);
      if (onLoginSuccess) {
        onLoginSuccess();
        console.log('onLoginSuccess called')
      } else {
        console.log('No onLoginSuccess callback provided')
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        setError(err.response.data?.message || `Login failed (${err.response.status})`);
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response from server - is it running?');
      } else {
        console.error('Request setup error:', err.message);
        setError('Login failed: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                <div className="bg-white px-4 py-5 sm:p-6 sm:pb-4">
                  <div className="text-center">
                    {/* Optional Logo */}
                    <img
                      className="mx-auto h-16 w-auto"
                      src="https://www.alsbbora.info/UploadCache/libfiles/22/5/600x338o/407.png"
                      alt="Company Logo"
                    />
                    
                    <div className="mt-3">
                      <Dialog.Title as="h3" className="text-2xl font-semibold text-slate-700">
                        Welcome
                      </Dialog.Title>
                      <p className="mt-1 text-sm text-slate-400">
                        Please sign in to continue
                      </p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                        Username:
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="username"
                          id="username"
                          value={formData.username}
                          onChange={handleChange}
                          className="form-input block w-full pl-10 pr-3 py-2 rounded-md border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter Username"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                        Password:
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="form-input block w-full pl-10 pr-3 py-2 rounded-md border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter Password"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                          Remember me
                        </label>
                      </div>
                      
                      <div className="text-sm">
                        <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                          Forgot Password?
                        </a>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="text-red-500 text-sm text-center">
                        {error}
                      </div>
                    )}
                    
                    <div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Signing In...' : 'Sign In'}
                      </button>
                    </div>
                    
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
