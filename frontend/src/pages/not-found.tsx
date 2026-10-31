import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link to="/" className="text-primary mt-4 inline-block text-sm underline">
        Back to engagements
      </Link>
    </div>
  )
}
