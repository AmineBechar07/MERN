import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import GlobalNavbar from './GlobalNavbar';

const FieldDetailPair = ({ fieldName, detailValue }) => (
  <div className="grid grid-cols-2 gap-4 mb-4">
    <div className="ms-4 font-medium dark:text-white">
      <p>{fieldName}</p>
    </div>
    <div className="text-gray-500 dark:text-gray-400">
      <p>{detailValue || 'N/A'}</p>
    </div>
    <div className="col-span-2 border-b border-gray-200 dark:border-gray-700"></div>
  </div>
);

export default function DetailedReport() {
  // All state declarations at the top
  const [collections, setCollections] = useState([]);
  const [currentPageData, setCurrentPageData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collectionCounts, setCollectionCounts] = useState({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const [currentPage, setCurrentPage] = useState(1);
  const [hoverStates, setHoverStates] = useState({
    mistral: { criteria_0: 0, criteria_1: 0, criteria_2: 0 },
    deepseek: { criteria_0: 0, criteria_1: 0, criteria_2: 0 }
  });
  const [evaluationsData, setEvaluationsData] = useState({});
  // const [pageCompletionStatus, setPageCompletionStatus] = useState({}); // Combined into pageCompletionColors logic
  const [pageCompletionColors, setPageCompletionColors] = useState({});
  const type = searchParams.get('type');
  const [currentTotalPages, setCurrentTotalPages] = useState(0); // Initialize to 0 or a sensible default
  const [isCurrentTypeEvaluationComplete, setIsCurrentTypeEvaluationComplete] = useState(false); // New state for submission
  
  // Fetch collections on mount (only once)
  useEffect(() => {
const fetchCollections = async () => {
  try {
    const collectionsRes = await fetch('/api/test-collections');
    if (!collectionsRes.ok) throw new Error('Failed to fetch collections');
    const collectionsData = await collectionsRes.json();
    
    // Add new collections for Cancer du sein Invasif
    const allCollections = [
      ...collectionsData,
      'invasive-stage-deepseek',
      'invasive-stage-biomistral'
    ];
    
    setCollections(allCollections);
    
    // Fetch counts for each collection
    const counts = {};
    for (const coll of allCollections) {
      const countRes = await fetch(`/api/evaluation/collection-counts?collection=${coll}`);
      if (countRes.ok) {
        counts[coll] = await countRes.json();
      }
    }
    setCollectionCounts(counts);
  } catch (err) {
    setError(err.message);
  }
};
    
    fetchCollections();
  }, []);

  const fetchPageStatusAndUpdateColor = async (page, cancerType) => {
    if (!cancerType) return; // Do not fetch if type is not set
    try {
      const res = await fetch(`/api/check-evaluation-status?pageNumber=${page}&cancerType=${cancerType}`);
      if (res.ok) {
        const { isComplete } = await res.json();
        setPageCompletionColors(prevColors => ({
          ...prevColors,
          [page]: isComplete ? 'green' : 'red'
        }));
      } else {
        // Handle non-ok responses, e.g., server error
        console.error(`Error checking page completion for page ${page}: Status ${res.status}`);
        setPageCompletionColors(prevColors => ({ ...prevColors, [page]: 'red' }));
      }
    } catch (err) {
      console.error(`Error fetching page completion status for page ${page}:`, err);
      setPageCompletionColors(prevColors => ({ ...prevColors, [page]: 'red' })); // Default to red on fetch error
    }
  };

  // Check page completion status for all pages when type or total pages change
  useEffect(() => {
    const checkAllPagesCompletion = async () => {
      if (type && currentTotalPages > 0) {
        for (let page = 1; page <= currentTotalPages; page++) {
          await fetchPageStatusAndUpdateColor(page, type);
        }
      }
    };
    checkAllPagesCompletion();
  }, [type, currentTotalPages]); // Only re-run if type or currentTotalPages changes

  const fetchAndSetExistingEvaluations = async (page, cancerType) => {
    if (!cancerType || !page) return;
    try {
      const res = await fetch(`/api/get-page-evaluations?pageNumber=${page}&cancerType=${cancerType}`);
      if (res.ok) {
        const { evaluations: fetchedEvaluations } = await res.json();
        
        setEvaluationsData(prev => {
          const newPageData = { ...prev[page] };

          if (fetchedEvaluations.mistral) {
            newPageData.mistral = { 
              ...newPageData.mistral, // Keep other potential fields like type_of_report
              ...fetchedEvaluations.mistral, 
              type_of_report: cancerType // Ensure type is set
            };
          } else if (!newPageData.mistral) { // Initialize if not present and not fetched
            newPageData.mistral = { criteria_1_rating: 0, criteria_2_rating: 0, criteria_3_rating: 0, type_of_report: cancerType };
          }

          if (fetchedEvaluations.deepseek) {
            newPageData.deepseek = { 
              ...newPageData.deepseek,
              ...fetchedEvaluations.deepseek,
              type_of_report: cancerType // Ensure type is set
            };
          } else if (!newPageData.deepseek) { // Initialize if not present and not fetched
            newPageData.deepseek = { criteria_1_rating: 0, criteria_2_rating: 0, criteria_3_rating: 0, type_of_report: cancerType };
          }
          
          return { ...prev, [page]: newPageData };
        });
      } else {
        console.error(`Failed to fetch existing evaluations for page ${page}, type ${cancerType}. Status: ${res.status}`);
        // Initialize with defaults if fetch fails, to ensure structure exists
        initializePageData(page, 'mistral', cancerType);
        initializePageData(page, 'deepseek', cancerType);
      }
    } catch (err) {
      console.error(`Error fetching existing evaluations for page ${page}, type ${cancerType}:`, err);
      // Initialize with defaults on error
      initializePageData(page, 'mistral', cancerType);
      initializePageData(page, 'deepseek', cancerType);
    }
  };
  
  useEffect(() => {
    console.log('Component mounted or type/page changed');
    let isMounted = true;

    const fetchCombinedDataAndEvaluations = async () => {
      if (!type || !currentPage) return; // Don't run if type or currentPage is not set

      setLoading(true);
      try {
        // Fetch main report data
        const reportRes = await fetch(`https://mern-1-bems.onrender.com/api/evaluation/detailed-report?page=${currentPage}&type=${type}`);
        if (!reportRes.ok) throw new Error('Failed to fetch evaluation data');
        const responseData = await reportRes.json();

        if (isMounted) {
          const mistralData = responseData.documents?.[0] || {};
          const deepseekData = responseData.documents?.[0] || {};

          const combinedData = {
            ...responseData,
            mistral: mistralData,
            deepseek: deepseekData,
          };
          
          if (responseData.totalPages !== undefined) {
            setCurrentTotalPages(responseData.totalPages);
          }
          
          console.log('Combined data:', combinedData);
          setCurrentPageData(combinedData);
          
          // After setting report data, fetch existing evaluations for this page and type
          await fetchAndSetExistingEvaluations(currentPage, type);
        }
      } catch (err) {
        console.error('Fetch error in combined data and evaluations:', err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCombinedDataAndEvaluations();

    return () => {
      console.log('Cleanup - unmounting or dependencies changed');
      isMounted = false;
    };
  }, [currentPage, type]);

  useEffect(() => {
    console.log('Current page data updated:', currentPageData);
  }, [currentPageData]);

  // Function to initialize or update evaluation data for a page
  // This function is now primarily a fallback or for explicit initialization if needed,
  // as fetchAndSetExistingEvaluations handles loading and defaults.
  const initializePageData = (page, modelName, reportType) => {
    setEvaluationsData(prev => {
      const pageExists = prev[page] && prev[page][modelName];
      if (pageExists) return prev; // Don't overwrite if data (even fetched) already exists

      return {
        ...prev,
        [page]: {
          ...prev[page],
          [modelName]: {
            criteria_1_rating: 0,
            criteria_2_rating: 0,
            criteria_3_rating: 0,
            type_of_report: reportType || type || 'default_report_type'
          }
        }
      };
    });
  };
  
  // Initialize data for the first page and both models on component mount or when type changes
  // This useEffect is less critical now as fetchAndSetExistingEvaluations handles loading.
  // However, it can serve as a fallback if the fetch fails early or for initial structure.
  useEffect(() => {
    if (type && currentPage) {
        // Check if data already exists from fetch before initializing to zeros
        if (!evaluationsData[currentPage] || !evaluationsData[currentPage]?.mistral) {
            initializePageData(currentPage, 'mistral', type);
        }
        if (!evaluationsData[currentPage] || !evaluationsData[currentPage]?.deepseek) {
            initializePageData(currentPage, 'deepseek', type);
        }
    }
  }, [type, currentPage, evaluationsData]); // Added evaluationsData to dependencies

  const handleRatingChange = async (page, modelName, criteriaIndex, rating) => { // Made async
    setEvaluationsData(prev => {
      const newEvaluations = { ...prev };
      if (!newEvaluations[page]) {
        newEvaluations[page] = {};
      }
      if (!newEvaluations[page][modelName]) {
        newEvaluations[page][modelName] = { 
            criteria_1_rating: 0, 
            criteria_2_rating: 0, 
            criteria_3_rating: 0,
            type_of_report: type 
        };
      }
      newEvaluations[page][modelName][`criteria_${criteriaIndex + 1}_rating`] = rating;
      newEvaluations[page][modelName].type_of_report = type; // Ensure type_of_report is set
      return newEvaluations;
    });
    await saveCurrentPageEvaluations(); // Save after rating change to trigger real-time check
  };

  const handleHoverChange = (modelName, criteriaIndex, starValue) => {
    setHoverStates(prev => ({
      ...prev,
      [modelName]: {
        ...prev[modelName],
        [`criteria_${criteriaIndex}`]: starValue
      }
    }));
  };

  const saveCurrentPageEvaluations = async () => {
    if (!evaluationsData[currentPage] || !type) {
      console.log("No evaluation data to save for current page or type is missing", currentPage, type);
      return false; // Indicate save was not attempted or failed
    }

    setLoading(true);
    let allSavesSuccessful = true;

    for (const modelName of ['mistral', 'deepseek']) {
      if (evaluationsData[currentPage][modelName]) {
        const currentModelData = evaluationsData[currentPage][modelName];
        const payload = {
          id_report: currentPage,
          model_name: modelName,
          type_of_report: currentModelData.type_of_report || type,
          criteria_1_rating: currentModelData.criteria_1_rating || 0,
          criteria_2_rating: currentModelData.criteria_2_rating || 0,
          criteria_3_rating: currentModelData.criteria_3_rating || 0,
          // userId: "some_user_id" // TODO: Get actual userId if available/needed
        };

        try {
          // Only proceed if there's actual rating data to save
          if (payload.criteria_1_rating > 0 || payload.criteria_2_rating > 0 || payload.criteria_3_rating > 0) {
            const res = await fetch('https://mern-1-bems.onrender.com/api/evaluations/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (!res.ok) {
              const errorData = await res.json();
              throw new Error(`Failed to save ${modelName} evaluation: ${errorData.message || res.statusText}`);
            }

            const result = await res.json();
            console.log(`${modelName} evaluation saved:`, result.data);
            // console.log(`All criteria met for ${modelName} on page ${currentPage}:`, result.data.all_criteria_met); // Log kept for detail
            // The overall page color is determined by the count of 2 evaluations via fetchPageStatusAndUpdateColor.
          }
        } catch (err) {
          console.error(`Error saving ${modelName} evaluation for page ${currentPage}:`, err);
          setError(prevError => `${prevError || ''} Failed to save ${modelName}: ${err.message}. `);
          allSavesSuccessful = false;
        }
      }
    }
    setLoading(false);
    // After attempting all saves, update the color for the current page
    if (type) { // Ensure type is available before calling
        await fetchPageStatusAndUpdateColor(currentPage, type);
    }
    return allSavesSuccessful;
  };


  const handlePageChange = async (page) => {
    if (page === currentPage) return; // Do nothing if clicking the current page
    if (page >= 1 && page <= currentTotalPages) {
      console.log('Saving evaluations before page change...');
      await saveCurrentPageEvaluations(); // Removed unused 'saved' variable
      // console.log('Save completed with status:', saved); // 'saved' is not defined
      // console.log('Current completion status:', pageCompletionStatus); // pageCompletionStatus was removed
      setCurrentPage(page);
      initializePageData(page, 'mistral');
      initializePageData(page, 'deepseek');
      window.scrollTo(0, 0); // Scroll to top
    }
  };

  const handleNext = async () => {
    if (currentPage < currentTotalPages) {
      await saveCurrentPageEvaluations(); // Ensure save is awaited
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      initializePageData(nextPage, 'mistral');
      initializePageData(nextPage, 'deepseek');
      window.scrollTo(0, 0); // Scroll to top
    }
  };

  const handlePrev = async () => {
    if (currentPage > 1) {
      await saveCurrentPageEvaluations();
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      initializePageData(prevPage, 'mistral');
      initializePageData(prevPage, 'deepseek');
      window.scrollTo(0, 0); // Scroll to top
    }
  };
  
  // Effect to log evaluationsData and pageCompletionStatus when they change
  useEffect(() => {
    console.log("evaluationsData updated:", evaluationsData);
  }, [evaluationsData]);

  // useEffect(() => {
  //   console.log("pageCompletionStatus updated:", pageCompletionColors); // Corrected to pageCompletionColors
  // }, [pageCompletionColors]);


  // Effect to determine if all evaluations for the current type are complete
  useEffect(() => {
    // Removed the specific 'non-invasive' check here. 
    // The button's state will now solely depend on all pages being green.

    let calculatedAllPagesDone = false;
    if (currentTotalPages > 0 && Object.keys(pageCompletionColors).length >= currentTotalPages) {
      let allGreen = true;
      for (let i = 1; i <= currentTotalPages; i++) {
        if (pageCompletionColors[i] !== 'green') {
          allGreen = false;
          break;
        }
      }
      calculatedAllPagesDone = allGreen;
    }
    
    // If evaluations just became complete
    // Removed window.scrollTo(0, 0);

    // Update the state only if it has changed
    if (calculatedAllPagesDone !== isCurrentTypeEvaluationComplete) {
        setIsCurrentTypeEvaluationComplete(calculatedAllPagesDone);
    }
  }, [pageCompletionColors, currentTotalPages, type, isCurrentTypeEvaluationComplete]);

  const handleSubmitCurrentTypeEvaluations = async () => {
    // First, ensure the current page's evaluations are saved.
    const saveSuccess = await saveCurrentPageEvaluations();
    if (saveSuccess) {
      // Optionally, re-check completion status if save might affect it, though fetchPageStatusAndUpdateColor should handle it.
      // Then navigate or perform other submission logic
      console.log('All evaluations for the current type submitted, navigating to validate modal.');
      navigate('/validate-modal'); // Navigate to ValidateModal
    } else {
      console.error('Failed to save current page evaluations before submitting type.');
      // Handle save failure, perhaps by showing an error message to the user.
    }
  };


  return (
    <div className="min-h-full">
      <GlobalNavbar 
        onSave={saveCurrentPageEvaluations} 
        isSubmissionEnabled={isCurrentTypeEvaluationComplete}
        onSubmitClick={handleSubmitCurrentTypeEvaluations}
      />
      <div className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
             Rapport Détaillé
            </h2>

            {/* First Document Display */}
            <div className="border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Les informations du Patient</h3>
              {loading && Object.keys(currentPageData).length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-2">Chargement des informations du patient...</p>
                </div>
              ) : (
                <div className="space-y-4 mt-12"> {/* Added mt-12 to mb-16 on h3 to keep spacing consistent */}
                  {Object.keys(currentPageData).length === 0 && !loading ? (
                    <div className="text-center text-gray-500 py-4">
                      Aucune donnée de document disponible.
                    </div>
                  ) : (
                    <>
                      {Object.entries(currentPageData.mistral || {})
                        .filter(([key]) => {
                          const excludedKeys = ['_id', 'page', 'type','id_report', 'Étiquette', 'Explication de l\'Étiquette', 'Bio Étiquette', 'Bio Explication de l\'Étiquette'];
                          return !excludedKeys.includes(key) && 
                                 !key.startsWith('criteria');
                        })
                        .map(([key, value]) => (
                          <FieldDetailPair 
                            key={key} 
                            fieldName={key} 
                            detailValue={value?.toString()} 
                          />
                        ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Current Page Data Display */}
            {(!loading || Object.keys(currentPageData).length > 0) && ( // Show evaluation cards even if patient info is loading but cards have data
              <div className="border rounded-lg p-6 mb-6  bg-gray-100">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EvaluationCard 
                    title="Response Mistral"
                    modelName="mistral"
                    displayData={currentPageData?.mistral}
                    ratingsData={evaluationsData[currentPage]?.mistral}
                    hoverStatesForCard={hoverStates.mistral} // Pass the specific model's hover states
                    onHoverChange={(criteriaIndex, star) => handleHoverChange('mistral', criteriaIndex, star)}
                    onRatingChange={(criteriaIndex, rating) => handleRatingChange(currentPage, 'mistral', criteriaIndex, rating)}
                    loading={loading}
                    cancerType={type}
                  />
                  <EvaluationCard
                    title="Response DeepSeek"
                    modelName="deepseek"
                    displayData={currentPageData?.deepseek}
                    ratingsData={evaluationsData[currentPage]?.deepseek}
                    hoverStatesForCard={hoverStates.deepseek} // Pass the specific model's hover states
                    onHoverChange={(criteriaIndex, star) => handleHoverChange('deepseek', criteriaIndex, star)}
                    onRatingChange={(criteriaIndex, rating) => handleRatingChange(currentPage, 'deepseek', criteriaIndex, rating)}
                    loading={loading}
                    cancerType={type}
                  />
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className={`flex items-center px-4 py-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50 cursor-pointer'}`}
                  >
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    Retour
                  </button>

                  <div className="flex space-x-2 mt-4">
                    {currentTotalPages > 0 && Array.from({ length: currentTotalPages }, (_, i) => {
                      const page = i + 1;
                      let buttonClass = 'cursor-pointer'; 
                      if (currentPage === page) {
                        buttonClass += ' bg-blue-600 text-white'; // Blue for current page
                      } else if (pageCompletionColors[page] === 'green') {
                        buttonClass += ' bg-green-500 text-white hover:bg-green-600'; // Green if complete
                      } else {
                        buttonClass += ' bg-red-500 text-white hover:bg-red-600'; // Default red
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${buttonClass}`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  {/* Always show Next button, disable if on last page. Removed "Submit Evaluations" button. */}
                  <button
                    onClick={handleNext}
                    disabled={currentPage === currentTotalPages || currentTotalPages === 0}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      (currentPage === currentTotalPages || currentTotalPages === 0)
                        ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                        : 'text-blue-600 hover:bg-blue-50 cursor-pointer'
                    }`}
                  >
                    Suivant
                    <ChevronRightIcon className="h-5 w-5 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EvaluationCard({ title, modelName, displayData, ratingsData, hoverStatesForCard, onHoverChange, onRatingChange, loading, cancerType }) {
  const localRatingsData = ratingsData || { criteria_1_rating: 0, criteria_2_rating: 0, criteria_3_rating: 0 };
  const localHoverStates = hoverStatesForCard || { criteria_0: 0, criteria_1: 0, criteria_2: 0 };

  return (
    <div className="border rounded-lg p-6 h-full">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <div className="border-b border-gray-300 mb-4"></div>
      <div className="mb-4 space-y-4">
        {modelName === 'mistral' && (
          <>
            <div className="bg-green-50 p-3 rounded-md border border-green-200">
              <h4 className="font-bold text-green-800">Étiquette</h4>
              <p className="text-green-700">
                {displayData?.["Étiquette"] || "Aucune étiquette disponible"}
              </p>
            </div>
            {(displayData?.["Explication de l\'Étiquette"]) && (
              <div className="bg-green-50 p-3 rounded-md border border-green-200">
                <h4 className="font-bold text-green-800">Explication de l'Étiquette</h4>
                <p className="text-green-700">
                  {displayData?.["Explication de l\'Étiquette"]}
                </p>
              </div>
            )}
          </>
        )}
        {modelName === 'deepseek' && (
          <>
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <h4 className="font-bold text-blue-800">Étiquette</h4>
              <p className="text-blue-700">
                {displayData?.["Étiquette"] || "Aucune étiquette DeepSeek disponible"}
              </p>
            </div>
            {(displayData?.["Explication de l'Étiquette"]) && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <h4 className="font-bold text-blue-800">Explication de l'Étiquette</h4>
                <p className="text-blue-700">
                  {displayData?.["Explication de l'Étiquette"]}
                </p>
              </div>
            )}
          </>
        )}
      </div>
      <div className="space-y-4">
            <AnimatePresence mode="wait">
              {displayData ? ( 
          <>
            {modelName === 'mistral' && (
              <>
                {displayData.field3 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-bold">Field 3:</div>
                    <div className="break-words">{displayData.field3?.toString() || 'N/A'}</div>
                  </div>
                )}
                {displayData.field4 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-bold">Field 4:</div>
                    <div className="break-words">{displayData.field4?.toString() || 'N/A'}</div>
                  </div>
                )}
              </>
            )}
            {modelName === 'deepseek' && (
              <>
                {displayData.field5 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-bold">Field 5:</div>
                    <div className="break-words">{displayData.field5?.toString() || 'N/A'}</div>
                  </div>
                )}
                {displayData.field6 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-bold">Field 6:</div>
                    <div className="break-words">{displayData.field6?.toString() || 'N/A'}</div>
                  </div>
                )}
              </>
            )}
          </>
              ) : (
                <motion.div
                  key={`no-data-${modelName}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center text-gray-500 py-4"
                >
                  Aucune donnée spécifique trouvée pour {modelName}
                </motion.div>
              )}
            </AnimatePresence>
      </div>
      
      {/* Rating Section (Restored) */}
      <div className="mt-6 space-y-6 relative z-10">
        <h4 className="text-md font-semibold text-gray-700">Critères d'Évaluation: </h4>
        {['Exactitude du Diagnostic', 'Complétude des Informations', 'Clarté et Pertinence des Recommandations'].map((criteriaName, i) => (
          <div key={`${modelName}-rating-${i}`} className="space-y-2">
            <label className="block font-medium">{criteriaName}</label>
            {/* Pass criteria index 'i' to onHoverChange for mouseLeave */}
            <div className="flex items-center cursor-pointer" onMouseLeave={() => onHoverChange(i, 0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-8 h-8 ms-3 transition-all duration-300 transform hover:scale-110 ${
                    (localRatingsData?.[`criteria_${i+1}_rating`] >= star || localHoverStates?.[`criteria_${i}`] >= star) ? 'text-yellow-300' : 'text-gray-300'
                  }`}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 20"
                  onMouseEnter={() => onHoverChange(i, star)} // Pass criteria index 'i'
                  onClick={() => onRatingChange(i, star)}
                >
                  <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                </svg>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
