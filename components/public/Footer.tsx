import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Jesus Youth SJCET. All rights reserved.
          </div>
          
          <div className="flex gap-6 text-sm">
            <Link 
              href="/terms" 
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              href="/privacy" 
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}