const Loading = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] items-center justify-center px-4"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600 motion-reduce:animate-pulse" />

        <p className="text-sm font-medium text-[#6B6785]">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;