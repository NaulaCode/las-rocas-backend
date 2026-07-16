export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="flex justify-between pt-4 border-t border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="h-[600px] md:h-[700px] bg-gray-200 animate-pulse flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="h-8 w-32 bg-gray-300 rounded mx-auto" />
        <div className="h-12 w-96 bg-gray-300 rounded max-w-[80vw] mx-auto" />
        <div className="h-6 w-64 bg-gray-300 rounded mx-auto" />
        <div className="h-6 w-48 bg-gray-300 rounded mx-auto" />
        <div className="flex gap-4 justify-center pt-4">
          <div className="h-14 w-40 bg-gray-300 rounded-full" />
          <div className="h-14 w-40 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-white/10" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="h-5 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-full" />
        <div className="h-4 bg-white/10 rounded w-2/3" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center space-y-4">
        <div className="w-16 h-16 bg-primary-200 rounded-full mx-auto" />
        <div className="h-4 w-48 bg-primary-200 rounded mx-auto" />
      </div>
    </div>
  );
}
