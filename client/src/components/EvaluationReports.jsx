import { useState } from 'react';
import GlobalNavbar from './GlobalNavbar';

export default function EvaluationReports() {
  // Sample data - replace with your actual data structure
  const [report] = useState({
    patientId: 'PID-2023-001',
    diagnosis: 'Early stage non-invasive carcinoma',
    treatmentPlan: 'Monitoring with regular follow-ups',
    lastEvaluation: '2023-05-15',
    nextAppointment: '2023-08-20'
  });

  return (
    <div className="min-h-full">
      <GlobalNavbar />
      <div className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow">
            {/* Card Header */}
            <div className="pb-4 mb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Rapport du cancer avancé du sein</h2>
            </div>
            
            {/* Patient ID */}
            <div className="flex py-4 border-b border-gray-200">
              <div className="w-1/3 font-bold">ID Patient</div>
              <div className="w-2/3 text-gray-500">{report.patientId}</div>
            </div>
            
            {/* Diagnosis */}
            <div className="flex py-4 border-b border-gray-200">
              <div className="w-1/3 font-bold">Diagnostic</div>
              <div className="w-2/3 text-gray-500">{report.diagnosis}</div>
            </div>
            
            {/* Treatment Plan */}
            <div className="flex py-4 border-b border-gray-200">
              <div className="w-1/3 font-bold">Plan de traitement</div>
              <div className="w-2/3 text-gray-500">{report.treatmentPlan}</div>
            </div>
            
            {/* Last Evaluation */}
            <div className="flex py-4 border-b border-gray-200">
              <div className="w-1/3 font-bold">Dernière évaluation</div>
              <div className="w-2/3 text-gray-500">{report.lastEvaluation}</div>
            </div>
            
            {/* Next Appointment */}
            <div className="flex py-4">
              <div className="w-1/3 font-bold">Prochain rendez-vous</div>
              <div className="w-2/3 text-gray-500">{report.nextAppointment}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
