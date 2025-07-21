// import React from 'react';
// import { Session } from 'next-auth'; // Import Session type
// import { signOut } from 'next-auth/react';

// interface AdminDashboardHeaderProps {
//   session: Session | null;
// }

// export default function AdminDashboardHeader({ session }: AdminDashboardHeaderProps) {
//   return (
//     <div className="bg-white shadow-xl border-b border-gray-100 backdrop-blur-sm">
//       <div className="px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center py-8">
//           <div className="space-y-1">
//             <div className="flex items-center space-x-3">
//               <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-xl shadow-lg">
//                 <span className="text-5xl">📚</span>
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
//                   Dashboard Admin
//                 </h1>
//                 <p className="text-sm text-gray-500 font-medium tracking-wide">
//                   Literasi Digital Management System
//                 </p>
//               </div>
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-6">
//             <div className="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
//               <div className="relative">
//                 <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
//                   <span className="text-white font-bold text-sm">
//                     {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'A'}
//                   </span>
//                 </div>
//                 <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-sm font-semibold text-gray-800">
//                   {session?.user?.name || session?.user?.email}
//                 </span>
//                 <span className="text-xs text-gray-500 font-medium">Administrator</span>
//               </div>
//             </div>
            
//             <button
//               onClick={() => signOut({ callbackUrl: '/admin/login' })}
//               className="group relative inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
//             >
//               <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
//               <svg className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
//                 />
//               </svg>
//               <span className="relative">Logout</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }