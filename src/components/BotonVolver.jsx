import { useNavigate } from 'react-router-dom';

const BotonVolver = ({ texto = 'Volver', ruta = '/' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(ruta)}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md 
      bg-gray-200 hover:bg-gray-300 text-gray-800 
      dark:bg-black dark:hover:bg-gray-800 dark:text-white 
      font-medium shadow-sm transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {texto}
    </button>
  );
};

export default BotonVolver;
