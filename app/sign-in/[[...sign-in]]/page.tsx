import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black relative">
      {/* On remet ton fond stylé en arrière-plan */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#1e3a8a,_black,_#7f1d1d)] z-0" />
      
      <div className="relative z-10">
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-red-600 hover:opacity-90 transition-all',
              card: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-white/60',
              socialButtonsBlockButton: 'bg-white/5 border-white/10 text-white hover:bg-white/10',
              socialButtonsBlockButtonText: 'text-white',
              formFieldLabel: 'text-white/70',
              formFieldInput: 'bg-white/5 border-white/10 text-white',
              footerActionText: 'text-white/60',
              footerActionLink: 'text-blue-400 hover:text-blue-300'
            }
          }}
        />
      </div>
    </div>
  );
}