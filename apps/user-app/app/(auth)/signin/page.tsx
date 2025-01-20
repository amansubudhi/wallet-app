import Signin from "../../../components/auth/Signin"
import { Sparkles } from "lucide-react"
import Image from 'next/image'

export default function SigninPage() {
    return (
        <div className="bg-white flex h-screen">
            <div className="Left-side w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="form-container max-w-[400px] space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold">Simplify Your Finances</h1>
                            <Sparkles className="h-6 w-6 text-yellow-500" />
                        </div>

                        <p className="">Experience seamless money management with WalletApp. Send and receive money with ease.</p>
                    </div>
                    <Signin />
                </div>
            </div>
            <div className="Right-side hidden lg:block lg:w-1/2 relative bg-gray-100">
                <div className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1470&ixlib=rb-4.0.3"
                        alt="Digital wallet app on smartphone"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

            </div>
        </div>
    )
}