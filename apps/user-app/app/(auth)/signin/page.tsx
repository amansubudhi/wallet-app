import Signin from "../../../components/auth/Signin"


export default function SigninPage() {
    return (
        <div className="bg-white flex h-screen">
            <div className="Left-side w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="form-container max-w-[400px] space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">Simplify Your Finances</h1>
                        <p className="">Experience seamless money management with WalletApp. Send and recieve money with ease.</p>
                    </div>
                    <Signin />
                </div>
            </div>
            <div className="Right-side">Right</div>
        </div>
    )
}