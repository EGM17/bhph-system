import PublicLayout from '@/components/public/layout/PublicLayout'

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="container-section py-32 text-center">
        <p className="text-8xl font-bold text-blue-600 mb-4">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page not found</h1>
        <p className="text-gray-500 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <a href="/" className="btn-primary">
          Go back home
        </a>
      </div>
    </PublicLayout>
  )
}
