/*
  This example requires Tailwind CSS v2.0+ 
  
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  const colors = require('tailwindcss/colors')
  
  module.exports = {
    // ...
    theme: {
      extend: {
        colors: {
          rose: colors.rose,
        },
      },
    },
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Menu, Popover, Transition } from '@headlessui/react'
import {
  ChatBubbleLeftEllipsisIcon,
  CodeBracketIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  FlagIcon,
  HandThumbUpIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ShareIcon,
  StarIcon,
} from '@heroicons/react/20/solid'
import {
  ArrowTrendingUpIcon,
  Bars3Icon,
  BellIcon,
  FireIcon,
  HomeIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const activityItems = [
  {
    user: {
      name: 'Amine Bechar',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    commit: '2d89f0c8',
    branch: 'main',
    status: 'Terminé',
    duration: '25s',
    date: 'Il y a 45 minutes',
    dateTime: '2023-01-23T11:00',
  },
  // More items...
]

const user = {
  name: 'Chelsea Hagon',
  email: 'chelsea.hagon@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}
const navigation = [
  { name: 'Accueil', to: '/home', icon: HomeIcon, current: true },
  
]
const statuses = { 'Terminé': 'text-green-400 bg-green-400/10', 'Erreur': 'text-rose-400 bg-rose-400/10' }


const userNavigation = [
  { name: 'Votre Profil', href: '#' },
  { name: 'Paramètres', href: '#' },
  { name: 'Se déconnecter', href: '#' },
]
const communities = [
  
]
const tabs = [
  { name: 'Tous', href: '#', current: true },
  { name: 'Inachevés', href: '#', current: false },
  { name: 'Terminés', href: '#', current: false },
]
const questions = [
  {
    id: '81614',
    likes: '29',
    replies: '11',
    views: '2.7k',
    author: {
      name: 'Amine Bechar',
      imageUrl:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      href: '#',
    },
    date: 'March 9 at 11:43 AM',
    datetime: '2020-12-09T11:43:00',
    href: '#',
    title: 'What would you have done differently if you ran Jurassic Park?',
    body: `
      <p>Jurassic Park was an incredible idea and a magnificent feat of engineering, but poor protocols and a disregard for human safety killed what could have otherwise been one of the best businesses of our generation.</p>
      <p>Ultimately, I think that if you wanted to run the park successfully and keep visitors safe, the most important thing to prioritize would be&hellip;</p>
    `,
  },
  // More questions...
]
const whoToFollow = [
  {
    name: 'Leonard Krasner',
    handle: 'leonardkrasner',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  // More people...
]
const trendingPosts = [
  {
    id: 1,
    user: {
      name: 'Floyd Miles',
      imageUrl:
        'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    body: 'What books do you have on your bookshelf just to look smarter than you actually are?',
    comments: 291,
  },
  // More posts...
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-100">
        <body class="h-full">
        ```
      */}
      <div className="min-h-full">
        {/* When the mobile menu is open, add `overflow-hidden` to the `body` element to prevent double scrollbars */}
        <Popover
          as="header"
          className={({ open }) =>
            classNames(
              open ? 'fixed inset-0 z-40 overflow-y-auto' : '',
              'bg-white shadow-sm lg:static lg:overflow-y-visible'
            )
          }
        >
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative flex justify-between lg:gap-8 xl:grid xl:grid-cols-12">
                  <div className="flex md:absolute md:inset-y-0 md:left-0 lg:static xl:col-span-2">
                    <div className="flex flex-shrink-0 items-center">
                      <a href="#">
                        <img
                          className="block h-12 w-auto"
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF9FjUzdW5exwb9-VKsHXjHAxVZQnoZehDyvB9euURu-h0YdsIeefnwcQhLyFxiy8P3Bs&usqp=CAU"
                          alt="University of Sharjah"
                        />
                      </a>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 md:px-8 lg:px-0 xl:col-span-6">
                    <div className="flex items-center px-6 py-4 md:mx-auto md:max-w-3xl lg:mx-0 lg:max-w-none xl:px-0">
                      <div className="w-full">
                        <label htmlFor="search" className="sr-only">
                          Rechercher
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </div>
                          <input
                            id="search"
                            name="search"
                            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-rose-500 focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-rose-500 sm:text-sm"
                            placeholder="Rechercher"
                            type="search"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center md:absolute md:inset-y-0 md:right-0 lg:hidden">
                    {/* Mobile menu button */}
                    <Popover.Button className="-mx-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-500">
                      <span className="sr-only">Ouvrir le menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Popover.Button>
                  </div>
                <div className="hidden lg:flex lg:items-center lg:justify-end xl:col-span-4">
                  <button 
                    onClick={() => {
                      console.log('Signing out');
                      // In a real app, we would call a logout API here
                      window.location.reload(); // Temporary solution to reset state
                    }}
                    className="text-sm font-medium text-gray-900 hover:underline"
                  >
                    Se déconnecter
                  </button>
                  <a
                    href="#"
                    className="ml-5 flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Voir les notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </a>

                  <Link
                    to="/addeval"
                    className="ml-8 inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Nouvelle Évaluation
                  </Link>
                  
                </div>
                </div>
              </div>

              <Popover.Panel as="nav" className="lg:hidden" aria-label="Global">
                <div className="mx-auto max-w-3xl space-y-1 px-2 pt-2 pb-3 sm:px-4">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      aria-current={item.current ? 'page' : undefined}
                      className={classNames(
                        item.current ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-50',
                        'block rounded-md py-2 px-3 text-base font-medium'
                      )}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="mx-auto flex max-w-3xl items-center px-4 sm:px-6">
                    
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user.name}</div>
                      <div className="text-sm font-medium text-gray-500">{user.email}</div>
                    </div>
                    <button
                      type="button"
                      className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">Voir les notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mx-auto mt-3 max-w-3xl space-y-1 px-2 sm:px-4">
                    {userNavigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block rounded-md py-2 px-3 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="mx-auto mt-6 max-w-3xl px-4 sm:px-6">
                  <Link
                    to="/addeval"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-rose-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-rose-700"
                  >
                    Nouvelle Évaluation
                  </Link>

                  <div className="mt-6 flex justify-center">
                    <a href="#" className="text-base font-medium text-gray-900 hover:underline">
                      Passer en Premium
                    </a>
                  </div>
                </div>
              </Popover.Panel>
            </>
          )}
        </Popover>

        <div className="py-10">
          <div className="mx-auto max-w-3xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-12 lg:gap-8 lg:px-8">
            <div className="hidden lg:col-span-3 lg:block xl:col-span-2">
              <nav aria-label="Sidebar" className="sticky top-4 divide-y divide-gray-300">
                <div className="space-y-1 pb-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.to}
                      className={classNames(
                        item.current ? 'bg-gray-200 text-gray-900' : 'text-gray-700 hover:bg-gray-50',
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      <item.icon
                        className={classNames(
                          item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                          'flex-shrink-0 -ml-1 mr-3 h-6 w-6'
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  ))}
                </div>
               </nav>
            </div>
            <main className="lg:col-span-9 xl:col-span-6">
              <div className="px-4 sm:px-0">
                <div className="sm:hidden">
                  <label htmlFor="question-tabs" className="sr-only">
                    Sélectionner un onglet
                  </label>
                  <select
                    id="question-tabs"
                    className="block w-full rounded-md border-gray-300 text-base font-medium text-gray-900 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                    defaultValue={tabs.find((tab) => tab.current).name}
                  >
                    {tabs.map((tab) => (
                      <option key={tab.name}>{tab.name}</option>
                    ))}
                  </select>
                </div>
                <div className="hidden sm:block">
                  <nav className="isolate flex divide-x divide-gray-200 rounded-lg shadow" aria-label="Tabs">
                    {tabs.map((tab, tabIdx) => (
                      <a
                        key={tab.name}
                        href={tab.href}
                        aria-current={tab.current ? 'page' : undefined}
                        className={classNames(
                          tab.current ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700',
                          tabIdx === 0 ? 'rounded-l-lg' : '',
                          tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '',
                          'group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-6 text-sm font-medium text-center hover:bg-gray-50 focus:z-10'
                        )}
                      >
                        <span>{tab.name}</span>
                        <span
                          aria-hidden="true"
                          className={classNames(
                            tab.current ? 'bg-rose-500' : 'bg-transparent',
                            'absolute inset-x-0 bottom-0 h-0.5'
                          )}
                        />
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
              <div className="mt-4">
                <h1 className="sr-only">Recent questionss</h1>
                <ul role="list" className="space-y-4">
                  {questions.map((question) => (
                    <li key={question.id} className="bg-white px-4 py-6 shadow sm:rounded-lg sm:p-6">
                      <div className="border-t border-gray-200 pt-4">
                        <h2 className="px-4 text-base/7 font-semibold text-gray-900 sm:px-3 lg:px-4">Activité récente</h2>
                        <table className="mt-6 w-full text-left whitespace-nowrap">
                          <colgroup>
                            <col className="w-full sm:w-4/12" />
                            <col className="lg:w-4/12" />
                            <col className="lg:w-2/12" />
                            <col className="lg:w-1/12" />
                            <col className="lg:w-1/12" />
                          </colgroup>
                          <thead className="border-b border-gray-200 text-sm/6 text-gray-900">
                            <tr>
                              <th scope="col" className="py-2 pr-8 pl-4 font-semibold sm:pl-6 lg:pl-8">
                                Utilisateur
                              </th>
              
                              <th scope="col" className="py-2 pr-4 pl-0 text-right font-semibold sm:pr-8 sm:text-left lg:pr-20">
                                Statut
                              </th>
                            
                              <th
                                scope="col"
                                className="hidden py-2 pr-4 pl-0 text-right font-semibold sm:table-cell sm:pr-6 lg:pr-8"
                              >
                                Déployé le
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {activityItems.map((item) => (
                              <tr key={item.commit}>
                                <td className="py-4 pr-8 pl-4 sm:pl-6 lg:pl-8">
                                  <div className="flex items-center gap-x-4">
                                    <div className="truncate text-sm/6 font-medium text-gray-900">{item.user.name}</div>
                                  </div>
                                </td>        
                                <td className="py-4 pr-4 pl-0 text-sm/6 sm:pr-8 lg:pr-20">
                                  <div className="flex items-center justify-end gap-x-2 sm:justify-start">
                                    <time dateTime={item.dateTime} className="text-gray-600 sm:hidden">
                                      {item.date}
                                    </time>
                                    <div className={classNames(statuses[item.status], 'flex-none rounded-full p-1')}>
                                      <div className="size-1.5 rounded-full bg-current" />
                                    </div>
                                    <div className="hidden text-gray-900 sm:block">{item.status}</div>
                                  </div>
                                </td>
                                <td className="hidden py-4 pr-4 pl-0 text-right text-sm/6 text-gray-600 sm:table-cell sm:pr-6 lg:pr-8">
                                  <time dateTime={item.dateTime}>{item.date}</time>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                     
                    </li>
                  ))}
                </ul>
              </div>
            </main>
            
          </div>
        </div>
      </div>
    </>
  )
}
