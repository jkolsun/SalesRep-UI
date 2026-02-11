import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-dark">
      <div className="mb-8">
        <Image
          src="https://www.brightautomations.org/images/Bright_AutoLOGO.png"
          alt="Bright Automations"
          width={200}
          height={50}
          className="h-12 w-auto"
        />
      </div>

      <div className="glass-card rounded-2xl p-8 text-center max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-white mb-2">
          Sales Platform
        </h1>
        <p className="text-gray-400 mb-8">
          Internal sales operations tool for the Bright Automations team
        </p>

        <div className="space-y-4">
          <Link href="/login" className="block">
            <Button size="lg" className="w-full">
              Sign In
            </Button>
          </Link>

          <div className="flex gap-4 text-sm">
            <Link
              href="/rep/dashboard"
              className="flex-1 text-center text-gray-400 hover:text-white transition-colors"
            >
              Demo: Rep Portal
            </Link>
            <Link
              href="/admin/dashboard"
              className="flex-1 text-center text-gray-400 hover:text-white transition-colors"
            >
              Demo: Admin Portal
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Bright Automations
      </p>
    </div>
  )
}
