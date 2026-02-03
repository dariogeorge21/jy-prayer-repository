import { PrayerGrid } from '../components/public/PrayerGrid'
import { ProgramHeader } from '@/components/public/ProgramHeader'
import { Footer } from '@/components/public/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <ProgramHeader />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Intro Section */}
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-serif font-bold text-gradient mb-4">
              Join Us in Prayer
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Every prayer counts. Your intercession supports the Vitanova program
              and the spiritual journey of all participants. Together, we create
              a powerful wave of prayer.
            </p>
          </div>

          {/* Prayer Grid */}
          <PrayerGrid />

          {/* Info Section */}
          <div className="mt-16 text-center text-sm text-gray-500">
            <p>
              All prayers are anonymous and aggregated in real-time.
              <br />
              You can submit a prayer once every 30 seconds.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
