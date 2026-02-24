// import { STEPS } from "../constants";
// import type { StepId } from "../type";

// export function WizardSteps({ currentStep }: { currentStep: StepId }) {
//   return (
//     <div className="mb-8 overflow-x-auto">
//       <div className="flex min-w-max items-center justify-between">
//         {STEPS.map((step, index) => (
//           <div key={step.id} className="flex flex-1 items-center">
//             <div className="flex flex-col items-center">
//               <div
//                 className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl transition-all ${
//                   currentStep > step.id
//                     ? "border-emerald-500 bg-emerald-500 text-white"
//                     : currentStep === step.id
//                       ? "border-blue-500 bg-blue-500 text-white"
//                       : "border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800"
//                 }`}
//               >
//                 {currentStep > step.id ? "✓" : step.icon}
//               </div>
//               <span
//                 className={`mt-2 text-xs font-medium ${
//                   currentStep >= step.id
//                     ? "text-gray-900 dark:text-white"
//                     : "text-gray-400 dark:text-gray-600"
//                 }`}
//               >
//                 {step.name}
//               </span>
//             </div>

//             {index < STEPS.length - 1 && (
//               <div
//                 className={`mx-2 h-0.5 flex-1 ${
//                   currentStep > step.id
//                     ? "bg-emerald-500"
//                     : "bg-gray-300 dark:bg-gray-600"
//                 }`}
//               />
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
