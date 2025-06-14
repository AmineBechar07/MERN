import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import GlobalNavbar from './GlobalNavbar';

const evaluationTypes = [
  { key: 'advanced', name: 'Cancer du sein avancé', description: 'Pour les cancers de stade III/IV' },
  { key: 'non-invasive', name: 'Cancer du sein non invasif', description: 'Pour DCIS et LCIS' },
  { key: 'invasive', name: 'Cancer du sein invasif', description: 'Pour les cancers de stade I/II' }
];

const fetchEvaluationTypeStatus = async (type) => {
  // Step 1: Fetch totalPages for the current type
  const reportRes = await fetch(`https://mern-1-bems.onrender.com/api/evaluation/detailed-report?page=1&type=${type.key}`);
  if (!reportRes.ok) {
    throw new Error(`Failed to load page count for ${type.name}`);
  }
  const reportData = await reportRes.json();
  const totalPages = reportData.totalPages;

  if (totalPages === undefined || totalPages === 0) {
    return { isComplete: false, totalPages: 0, totalEvaluationsSubmitted: 0 };
  }

  // Step 2: Fetch completion status for the type using totalPages
  const statusRes = await fetch(`/api/evaluation-type-completion-status?cancerType=${type.key}&totalPages=${totalPages}`);
  if (!statusRes.ok) {
    throw new Error(`Failed to load completion status for ${type.name}`);
  }
  const statusData = await statusRes.json();
  return {
    isComplete: statusData.allPagesComplete,
    totalPages: totalPages,
    totalEvaluationsSubmitted: statusData.totalEvaluationsSubmitted || 0,
    completedEvaluationCount: statusData.completedEvaluationCount || 0
  };
};

function EvaluationTypeCard({ type }) {
  const { data: status, isLoading, error } = useQuery({
    queryKey: ['evaluationTypeStatus', type.key],
    queryFn: () => fetchEvaluationTypeStatus(type),
  });

  // Default to red
  let borderColor = 'border-red-500';
  let bgColor = 'bg-red-50';
  let hoverBgColor = 'hover:bg-red-100';
  let textColor = 'text-red-700';
  let subTextColor = 'text-red-500';

  if (!isLoading && status) {
    if (status.totalPages > 0 && status.totalEvaluationsSubmitted === status.totalPages * 2) {
      borderColor = 'border-green-500';
      bgColor = 'bg-green-50';
      hoverBgColor = 'hover:bg-green-100';
      textColor = 'text-green-700';
      subTextColor = 'text-green-500';
    }
  }

  return (
    <Link
      key={type.key}
      to={`/evaluation/split-screen?type=${type.key}`}
      className={`block w-full px-6 py-4 border-2 ${borderColor} ${bgColor} ${hoverBgColor} rounded-lg text-center transition-colors duration-200`}
    >
      <h3 className={`text-lg font-medium ${textColor}`}>
        {type.name}
        {isLoading && <span className="ml-2 text-sm">(Chargement...)</span>}
        {error && <span className="ml-2 text-sm text-red-500">({error.message})</span>}
      </h3>
      <p className={`text-sm ${subTextColor} mt-1`}>{type.description}</p>
      <p className={`text-xs ${subTextColor} mt-1`}>
        {status ? `(${status.totalEvaluationsSubmitted} / ${status.totalPages * 2} evaluations)` : ''}
      </p>
      {!isLoading && status && status.totalPages === 0 && !error && (
        <p className={`text-xs ${subTextColor} mt-1`}>Aucune page trouvée pour ce type.</p>
      )}
    </Link>
  );
}

export default function EvaluationTypeSelection() {
  const navigate = useNavigate();
  const queries = evaluationTypes.map(type => {
    return useQuery({
      queryKey: ['evaluationTypeStatus', type.key],
      queryFn: () => fetchEvaluationTypeStatus(type),
    });
  });

  const allTypesReadyForSubmission = useMemo(() => {
    return queries.every(query => {
      const { data: status } = query;
      return status && status.totalPages > 0 && status.totalEvaluationsSubmitted === status.totalPages * 2;
    });
  }, [queries]);

  const handleNavbarSubmit = () => {
    navigate('/centered-with-wide-buttons');
  };

  return (
    <div className="min-h-full">
      <GlobalNavbar
        isSubmissionEnabled={allTypesReadyForSubmission}
        onSubmitClick={handleNavbarSubmit}
      />
      <div className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Sélectionnez le type d'évaluation</h2>
            <div className="space-y-4">
              {evaluationTypes.map((type) => (
                <EvaluationTypeCard key={type.key} type={type} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
