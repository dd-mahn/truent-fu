import ResultClient from './ResultClient'; // We will create this client component next

export default function ResultPage() {
  return (
    <div className="container mx-auto min-h-screen"> {/* Assuming white result background */}
      {/* Similar header structure as the form page, but with dynamic data */}
      {/* The actual content will be rendered by ResultClient based on passed props or state */}
      <ResultClient />
    </div>
  );
} 