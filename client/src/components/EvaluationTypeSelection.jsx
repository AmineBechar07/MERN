import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlobalNavbar from './GlobalNavbar';
// import CenteredWithWideButtons from './centered_with_wide_buttons'; // This component is navigated to, not embedded here.

const evaluationTypes = [
  { key: 'advanced', name: 'Cancer du sein avancé', description: 'Pour les cancers de stade III/IV', defaultBorder: 'border-blue-500', defaultBg: 'bg-blue-50', defaultHoverBg: 'hover:bg-blue-100', defaultText: 'text-blue-700', defaultSubText: 'text-blue-500' },
  { key: 'non-invasive', name: 'Cancer du sein non invasif', description: 'Pour DCIS et LCIS', defaultBorder: 'border-orange-500', defaultBg: 'bg-orange-50', defaultHoverBg: 'hover:bg-orange-100', defaultText: 'text-orange-700', defaultSubText: 'text-orange-500' },
  { key: 'invasive', name: 'Cancer du sein invasif', description: 'Pour les cancers de stade I/II', defaultBorder: 'border-purple-500', defaultBg: 'bg-purple-50', defaultHoverBg: 'hover:bg-purple-100', defaultText: 'text-purple-700', defaultSubText: 'text-purple-500' }
];

// const disabledType = { 
//   key: 'invasive', 
//   name: 'Cancer du sein invasif', 
//   description: 'Bientôt disponible - Pour les cancers de stade I/II', 
//   disabled: true, 
//   defaultBorder: 'border-gray-300', 
//   defaultBg: 'bg-gray-100', 
//   defaultText: 'text-gray-500', 
//   defaultSubText: 'text-gray-400',
//   cursor: 'cursor-not-allowed opacity-50'
// };

export default function EvaluationTypeSelection() {
  const navigate = useNavigate();
  const [typeStatuses, setTypeStatuses] = useState({});
  const [error, setError] = useState(null);
  const [loadingStates, setLoadingStates] = useState(evaluationTypes.reduce((acc, type) => ({ ...acc, [type.key]: true }), {}));
  const [allTypesReadyForSubmission, setAllTypesReadyForSubmission] = useState(false);


  useEffect(() => {
    const fetchAllStatuses = async () => {
      setError(null);
      const newStatuses = {};

      for (const type of evaluationTypes) {
        setLoadingStates(prev => ({ ...prev, [type.key]: true }));
        try {
          // Step 1: Fetch totalPages for the current type
          const reportRes = await fetch(`https://mern-1-bems.onrender.com/api/evaluation/detailed-report?page=1&type=${type.key}`);
          if (!reportRes.ok) {
            console.warn(`Failed to fetch total pages for ${type.key}. Status: ${reportRes.status}`);
            newStatuses[type.key] = { isComplete: false, totalPages: 0, error: `Failed to load page count for ${type.name}` };
            setLoadingStates(prev => ({ ...prev, [type.key]: false }));
            continue; 
          }
          const reportData = await reportRes.json();
          const totalPages = reportData.totalPages;

          if (totalPages === undefined || totalPages === 0) {
            newStatuses[type.key] = { isComplete: false, totalPages: 0, error: totalPages === 0 ? `${type.name} has no pages.` : `Could not determine pages for ${type.name}.` };
            setLoadingStates(prev => ({ ...prev, [type.key]: false }));
            continue;
          }
          
          // Step 2: Fetch completion status for the type using totalPages
          const statusRes = await fetch(`/api/evaluation-type-completion-status?cancerType=${type.key}&totalPages=${totalPages}`);
          if (!statusRes.ok) {
            console.warn(`Failed to fetch completion status for ${type.key}. Status: ${statusRes.status}`);
            newStatuses[type.key] = { isComplete: false, totalPages: totalPages, error: `Failed to load completion status for ${type.name}` };
            setLoadingStates(prev => ({ ...prev, [type.key]: false }));
            continue;
          }
          const statusData = await statusRes.json();
          newStatuses[type.key] = { 
            isComplete: statusData.allPagesComplete, 
            totalPages: totalPages,
            totalEvaluationsSubmitted: statusData.totalEvaluationsSubmitted || 0,
            completedEvaluationCount: statusData.completedEvaluationCount || 0
            // error: statusData.allPagesComplete ? undefined : (status.error || 'Pending evaluations') // Retain existing error or set default
          };
          if (!statusData.allPagesComplete && !newStatuses[type.key].error) {
            // If not complete and no specific fetch error, mark as pending
            // This part might need refinement based on how errors are aggregated
          }


        } catch (err) {
          console.error(`Error fetching status for ${type.key}:`, err);
          newStatuses[type.key] = { isComplete: false, totalPages: 0, totalEvaluationsSubmitted: 0, completedEvaluationCount: 0, error: `Error loading data for ${type.name}.` };
        } finally {
          setLoadingStates(prev => ({ ...prev, [type.key]: false }));
        }
      }
      setTypeStatuses(newStatuses);

      // Check if all types are ready for submission
      let allReady = true;
      if (Object.keys(newStatuses).length === evaluationTypes.length) { // Ensure all statuses are fetched
        for (const type of evaluationTypes) {
          const status = newStatuses[type.key];
          if (!status || !(status.totalPages > 0 && status.totalEvaluationsSubmitted === status.totalPages * 2)) {
            allReady = false;
            break;
          }
        }
      } else {
        allReady = false; // Not all statuses fetched yet
      }
      setAllTypesReadyForSubmission(allReady);

    };

    fetchAllStatuses();
  }, []);

  const handleNavbarSubmit = () => {
    navigate('/centered-with-wide-buttons'); // As per user feedback for the route
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
            
            {error && <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}

            <div className="space-y-4">
              {evaluationTypes.map((type) => {
                const status = typeStatuses[type.key];
                const isLoading = loadingStates[type.key];
                let borderColor = type.defaultBorder;
                let bgColor = type.defaultBg;
                let hoverBgColor = type.defaultHoverBg;
                let textColor = type.defaultText;
                let subTextColor = type.defaultSubText;

                if (isLoading) {
                  borderColor = 'border-gray-300';
                  bgColor = 'bg-gray-100';
                  hoverBgColor = 'hover:bg-gray-200';
                  textColor = 'text-gray-500';
                  subTextColor = 'text-gray-400';
                } else if (status) {
                  // Condition for green: evaluations submitted is double the source pages, and there are source pages.
                  if (status.totalPages > 0 && status.totalEvaluationsSubmitted === status.totalPages * 2) {
                    borderColor = 'border-green-500';
                    bgColor = 'bg-green-50';
                    hoverBgColor = 'hover:bg-green-100';
                    textColor = 'text-green-700';
                    subTextColor = 'text-green-500';
                  } else {
                    borderColor = 'border-red-500';
                    bgColor = 'bg-red-50';
                    hoverBgColor = 'hover:bg-red-100';
                    textColor = 'text-red-700';
                    subTextColor = 'text-red-500';
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
                      {!isLoading && status && status.error && <span className="ml-2 text-sm text-red-500">({status.error})</span>}
                    </h3>
                    <p className={`text-sm ${subTextColor} mt-1`}>{type.description}</p>
                    <p className={`text-xs ${subTextColor} mt-1`}>
                      {status ? `(${status.totalEvaluationsSubmitted} / ${status.totalPages * 2} evaluations)` : ''}
                    </p>
                     {!isLoading && status && status.totalPages === 0 && !status.error && (
                        <p className={`text-xs ${subTextColor} mt-1`}>Aucune page trouvée pour ce type.</p>
                    )}
                  </Link>
                );
              })}
              
              {/* Disabled Type Example - Removed as it's now part of evaluationTypes */}
            </div>

            {/* Removed the old "Proceed to Final Submission" button */}
            {/* The submission is now handled by the GlobalNavbar's submit button */}

          </div>
        </div>
      </div>
    </div>
  );
}
