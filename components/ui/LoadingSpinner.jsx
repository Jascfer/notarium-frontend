export default function LoadingSpinner({ size = "md", text = "Yükleniyor..." }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="relative">
        {/* Ana spinner */}
        <div className={`${sizeClasses[size]} border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin`}></div>
        
        {/* İç spinner */}
        <div className={`${sizeClasses[size]} border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin absolute top-0 left-0`} 
             style={{ animationDelay: '0.5s', animationDirection: 'reverse' }}></div>
      </div>
      
      {/* Loading text */}
      <div className="mt-4 text-center">
        <p className="text-gray-600 font-medium">{text}</p>
        <div className="flex space-x-1 mt-2 justify-center">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
} 