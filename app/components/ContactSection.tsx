// app/components/ContactSection.tsx

export default function ContactSection() {
  return (
    <section id="contact" className="relative z-10 border-t border-stone-200/60 bg-white/40 backdrop-blur-md py-20 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3.5 py-1.5 rounded-full border border-orange-200/50">
            Nous Contacter
          </span>
          <h2 className="text-3xl font-black text-stone-900 mt-4">
            Restons en contact
          </h2>
          <p className="text-stone-500 text-sm mt-2">
            Pour toute question sur nos portées, nos disponibilités en pension ou un accompagnement éducatif.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Téléphone */}
          <div className="p-8 rounded-[2rem] bg-white border border-stone-200/80 shadow-sm text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-stone-900">Téléphone</h3>
            <p className="text-xs text-stone-500 mt-1">Du lundi au samedi</p>
            <a href="tel:0600000000" className="mt-4 text-sm font-black text-orange-600 hover:text-orange-700">
              06 00 00 00 00
            </a>
          </div>

          {/* Email */}
          <div className="p-8 rounded-[2rem] bg-white border border-stone-200/80 shadow-sm text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-stone-900">Email</h3>
            <p className="text-xs text-stone-500 mt-1">Réponse sous 24h</p>
            <a href="mailto:contact@inochi-inu.fr" className="mt-4 text-sm font-black text-orange-600 hover:text-orange-700">
              contact@inochi-inu.fr
            </a>
          </div>

          {/* Réseaux Sociaux */}
          <div className="p-8 rounded-[2rem] bg-white border border-stone-200/80 shadow-sm text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-stone-900">Suivez nos aventures</h3>
            <p className="text-xs text-stone-500 mt-1">Photos quotidiennes & actualités</p>
            <div className="mt-4 flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full">
                Instagram ➔
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full">
                Facebook ➔
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}