import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Si on est sur le site officiel en production, on ne bloque rien
  if (process.env.VERCEL_ENV === 'production') {
    return NextResponse.next();
  }

  // Sur la preview / dev : on demande un identifiant et un mot de passe
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // Définissez vos identifiants de test ici (ou via variables d'environnement)
    if (user === 'admin' && pwd === 'dev2026') {
      return NextResponse.next();
    }
  }

  return new NextResponse('Accès restreint à l’environnement de développement', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Dev Area"',
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};